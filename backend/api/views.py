from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache as django_cache
import os
import numpy as np
import logging
import tifffile
from celery.result import AsyncResult

from engine.engine_lib.src.model.ImageRaw_class import ImageRaw
from engine.engine_lib.src.model.extractor_model import ExtractorModel
from engine.engine_lib.src.model.decon_psf_model import DeconPsfModel
from .utils import save_as_tiff, pil_image_to_byte_stream, pass2cache
from .tasks import load_and_cache_image

logger = logging.getLogger(__name__)

def error_response(error_code, message_error, type_request):
    error_response = {
            'error': message_error
        }
    response = JsonResponse(error_response, status=error_code)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = type_request
    logger.info('Error response: %s', error_response['error'])
    return response

@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.getlist('file') and request.POST.get('image_type'):
        file_list = request.FILES.getlist('file')
        image_type = str(request.POST.get('image_type'))
        try:
            image_data = ImageRaw(fpath=file_list)
            pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])
            resolution = image_data.imArray.shape # Get the resolution of the image

            response_data = {
                'message': f'Image loaded successfully. Resolution: {resolution}',
                'resolution': resolution,
            }

            return JsonResponse(response_data)
        except ValueError as e:
            if 'voxel' in str(e) and request.POST.get('voxelX') and request.POST.get('voxelY') and request.POST.get('voxelZ'):
                voxelX = float(request.POST.get('voxelX'))
                voxelY = float(request.POST.get('voxelY'))
                voxelZ = float(request.POST.get('voxelZ'))
                voxel = np.array([voxelZ, voxelY, voxelX])
                try:
                    image_data = ImageRaw(fpath=file_list, voxelSizeIn=voxel)
                    pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])
                    response_data = {
                        'message': 'Beads extracting successfully',
                        'resolution': image_data.imArray.shape,
                    }

                    return JsonResponse(response_data)
                except ValueError as ve:
                    return error_response(400, str(ve), 'POST')
            else:
                return error_response(400, str(e), 'POST')
    else:
        if request.method != 'POST':
            return error_response(400, 'Invalid request method. Please make a POST request.', 'POST')
        elif not request.FILES.getlist('file'):
            return error_response(400, 'No files were uploaded.', 'POST')
        elif not request.POST.get('image_type'):
            return error_response(400, 'No image type specified.', 'POST')
        else:
            return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')

"""
@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.getlist('file') and request.POST.get('image_type'):
        file_list = request.FILES.getlist('file')
        image_type = str(request.POST.get('image_type'))
        voxelX = request.POST.get('voxelX')
        voxelY = request.POST.get('voxelY')
        voxelZ = request.POST.get('voxelZ')
        try:
            # Create the tmp folder in the main backend directory if it doesn't exist
            tmp_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tmp')
            os.makedirs(tmp_folder, exist_ok=True)

            # Save the uploaded files to the tmp folder
            file_paths = []
            for file_obj in file_list:
                file_path = os.path.join(tmp_folder, file_obj.name)
                with open(file_path, 'wb') as destination:
                    for chunk in file_obj.chunks():
                        destination.write(chunk)
                file_paths.append(file_path)

            # Enqueue the Celery task
            task = load_and_cache_image.delay(file_paths, image_type, voxelX, voxelY, voxelZ)

            response_data = {
                'message': 'Image loading task has been enqueued',
                'resolution': task.get(),
                'task_id': task.id
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')
    else:
        if request.method != 'POST':
            return error_response(400, 'Invalid request method. Please make a POST request.', 'POST')
        elif not request.FILES.getlist('file'):
            return error_response(400, 'No files were uploaded.', 'POST')
        elif not request.POST.get('image_type'):
            return error_response(400, 'No image type specified.', 'POST')
        else:
            return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')
"""

def check_task_status(request, task_id):
    try:
        task = AsyncResult(task_id)
    except Exception as e:
        response_data = {
            'message': 'Task not found',
            'status': 'error',
            'error_message': str(e),
        }
        return JsonResponse(response_data)

    if task.ready():
        try:
            resolution = task.get()  # Retrieve the result of the completed task
            response_data = {
                'message': 'Task completed',
                'status': 'completed',
                'resolution': resolution,
            }
        except Exception as e:
            response_data = {
                'message': 'Error occurred while processing the task',
                'status': 'error',
                'error_message': str(e),
            }
    else:
        response_data = {
            'message': 'Task still in progress',
            'status': 'in_progress',
        }

    return JsonResponse(response_data)


@csrf_exempt
def convert_image(request):
    if request.method == 'POST' and request.FILES.getlist('file') and request.POST.get('output_prefix'):
        input_files = request.FILES.getlist('file')
        output_prefix = request.POST.get('output_prefix')
        
        try:
            output_files = []
            for i, input_file in enumerate(input_files):
                stack = tifffile.imread(input_file)
                for j, slice in enumerate(stack):
                    output_file = f"{output_prefix}_{i+1:03}_{j+1:03}.tif"
                    tifffile.imwrite(output_file, slice)
                    output_files.append(output_file)

            return HttpResponse(output_files, content_type='application/json')
        except Exception as e:
            return HttpResponse(f"Error during conversion: {e}", status=400, content_type='application/json')
    
    return HttpResponse([], content_type='application/json')


@csrf_exempt
def bead_extract(request):
    if request.method == 'POST' and request.POST.get('select_size') and request.POST.get('bead_coords') and request.POST.get('is_deleted'):
        try:
            bead_extractor = ExtractorModel()
            cached_image = django_cache.get('beads_image')
            bead_extractor.SetMainImage(array=cached_image['imArray'], voxel=list(cached_image['voxel'].values()))
            select_size = int(request.POST.get('select_size'))
            bead_extractor.selectionFrameHalf = select_size / 2
            bead_coords = request.POST.get('bead_coords')
            bead_coords = eval(bead_coords)
            bead_extractor.beadCoords = bead_coords
            is_deleted_beads = bool(request.POST.get('is_deleted'))
            if is_deleted_beads:
                bead_extractor._extractedBeads = []
                print(bead_extractor.MarkedBeadsExtract())
                is_deleted_beads = False
            else:
                print(bead_extractor.MarkedBeadsExtract())

            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead','is_deleted_beads', 'blur_type'], [bead_extractor, cached_image, bead_extractor._beadCoords, bead_extractor._extractedBeads, bead_extractor._selectionFrameHalf, bead_extractor._averageBead, False, 'none'])
            print(bead_extractor._extractedBeads)
            extracted_beads_list = []
            if bead_extractor._extractedBeads: 
                print('Exists')
                for index, extracted_bead in enumerate(bead_extractor._extractedBeads):
                    tiff_image = save_as_tiff(image_raw=extracted_bead, is_one_page=True, filename=f"extracted_bead_{index}.tiff", outtype="uint8")
                    print(tiff_image)
                    image_byte_stream = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=True)
                    print(image_byte_stream)
                    extracted_beads_list.append(image_byte_stream)

            response_data = {
                'message': 'Beads extracting successfully',
                'extracted_beads': extracted_beads_list,
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


@csrf_exempt
def bead_average(request):
    if request.method == 'POST' and request.POST.get('blur_type'):
        try:
            bead_extractor = django_cache.get('bead_extractor')['data']
            bead_extractor.BeadsArithmeticMean()
            bead_extractor.BlurAveragedBead(request.POST.get('blur_type'))
            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead','is_deleted_beads', 'blur_type'], [bead_extractor, django_cache.get('bead_extractor')['beads_image'], django_cache.get('bead_extractor')['bead_coords'], django_cache.get('bead_extractor')['extract_beads'], django_cache.get('bead_extractor')['select_frame_half'], bead_extractor._averageBead, False, request.POST.get('blur_type')])

            avg_bead = django_cache.get('bead_extractor')['average_bead']
            if isinstance(avg_bead, ImageRaw):
                tiff_image = save_as_tiff(image_raw=avg_bead, is_one_page=False, filename=f"average_bead.tiff", outtype="uint8")
                response_data = {
                        'message': 'Bead averaging successfully',
                        'average_bead': pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False),
                    }
                return JsonResponse(response_data)
            else:
                return error_response(400, 'Invalid image data. Unable to save as TIFF.', 'POST')
        except Exception as e:
            return error_response(400, str(e), 'POST')
    else:
        return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


@csrf_exempt
def psf_extract(request):
    if request.method == 'POST' and request.POST.get('resolutionXY') and request.POST.get('resolutionZ') and request.POST.get('beadSize') and request.POST.get('iter') and request.POST.get('regularization') and request.POST.get('deconvMethod'):
        try:
            psf_extractor = DeconPsfModel()
            cached_image = django_cache.get('averaged_bead')

            voxel_size = [float(request.POST.get('resolutionZ')), float(request.POST.get('resolutionXY')), float(request.POST.get('resolutionXY'))]
            print(voxel_size)

            psf_extractor.SetPSFImage(array=cached_image['imArray'], voxel=voxel_size)

            # try to set iterations number
            try:
                psf_extractor.iterationNumber = request.POST.get('iter')
            except Exception as e:
                return error_response(400, str(e), 'POST')

            # try to set regularization param
            try:
                psf_extractor.regularizationParameter = request.POST.get('regularization')
            except Exception as e:
                return error_response(400, str(e), 'POST')

            # try to set bead radius param
            try:
                psf_extractor.beadDiameter = request.POST.get('beadSize')
            except Exception as e:
                return error_response(400, str(e), 'POST')

            # pass 2 cache all info 
            pass2cache('psf_extractor', ['extractor', 'average_bead', 'voxel', 'iter', 'regularization'], [psf_extractor, cached_image, voxel_size, request.POST.get('iter'), request.POST.get('regularization')])

            print(request.POST.get('deconvMethod'))

            # try to make PSF extraction
            psf_extractor.CalculatePSF(request.POST.get('deconvMethod'), None, None)
            print(f"result image shape: {psf_extractor.resultImage.imArray.shape}")
            
            # send result to client
            is_one_page = False
            tiff_image = save_as_tiff(image_raw=psf_extractor.resultImage, is_one_page=is_one_page, filename=f"extracted_psf.tiff", outtype="uint8")
            print(len(tiff_image), tiff_image[0])
            
            byte_stream = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=is_one_page)
            response_data = {
                'message': 'PSF extracted successfully',
                'extracted_psf': byte_stream,
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


def hello_world(request):
    return HttpResponse("Hello, world!")
