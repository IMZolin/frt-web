from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache as django_cache
import os
import numpy as np
import logging
from celery.result import AsyncResult

from engine.engine_lib.src.model.ImageRaw_class import ImageRaw
from engine.engine_lib.src.model.extractor_model import ExtractorModel
from engine.engine_lib.src.model.decon_psf_model import DeconPsfModel
from engine.engine_lib.src.model.decon_image_model import DeconImageModel
from engine.engine_lib.src.model.preproces_image_model import PreprocessImageModel
from engine.engine_lib.src.model.cnn_deconv_model import CNNDeconvModel
from .utils import save_as_tiff, pil_image_to_byte_stream, pass2cache, generate_projections
from .tasks import process_image_task

logger = logging.getLogger(__name__)


def error_response(status, message, method):
    return JsonResponse({'error': message, 'method': method}, status=status)


@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.getlist('file') and request.POST.get('image_type'):
        file_list = request.FILES.getlist('file')
        image_type = str(request.POST.get('image_type'))
        logger.info('Image type is %s', image_type)

        # Extract voxel parameters if present
        voxel_params = {
            'voxelX': request.POST.get('voxelX'),
            'voxelY': request.POST.get('voxelY'),
            'voxelZ': request.POST.get('voxelZ')
        }

        # Schedule the image processing task
        task = process_image_task.delay(
            [f.name for f in file_list],  # Send file names for processing
            image_type,
            voxel_params['voxelX'],
            voxel_params['voxelY'],
            voxel_params['voxelZ']
        )

        response_data = {
            'message': 'Image processing has started',
            'task_id': task.id
        }
        return JsonResponse(response_data)
    else:
        if request.method != 'POST':
            return error_response(400, 'Invalid request method. Please make a POST request.', 'POST')
        elif not request.FILES.getlist('file'):
            return error_response(400, 'No files were uploaded.', 'POST')
        elif not request.POST.get('image_type'):
            return error_response(400, 'No image type specified.', 'POST')
        else:
            return error_response(400, 'Invalid request. Please make a POST request with the required parameters.',
                                  'POST')


@csrf_exempt
def bead_mark(request):
    if request.method == 'POST' and request.POST.get('x') and request.POST.get('y') and request.POST.get('select_size'):
        try:
            bead_extractor = ExtractorModel()
            cached_image = django_cache.get('beads_image')
            bead_extractor.SetMainImage(array=cached_image['imArray'], voxel=list(cached_image['voxel'].values()))
            select_size = int(request.POST.get('select_size'))
            bead_extractor.selectionFrameHalf = select_size / 2
            x = round(float(request.POST.get('x')))  
            y = round(float(request.POST.get('y')))  
            x_center, y_center = bead_extractor.LocateFrameMaxIntensity3D(x, y)

            response_data = {
                'message': 'Beads extracting successfully',
                'center_coords': [int(x_center), int(y_center)],  
            }
            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead', 'blur_type'], [bead_extractor, cached_image, bead_extractor._beadCoords, bead_extractor._extractedBeads, bead_extractor._selectionFrameHalf, bead_extractor._averageBead, 'none'])
            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


@csrf_exempt
def bead_extract(request):
    if request.method == 'POST' and request.POST.get('select_size') and request.POST.get('bead_coords'):
        try:
            bead_extractor = ExtractorModel()
            cached_image = django_cache.get('beads_image')
            bead_extractor.SetMainImage(array=cached_image['imArray'], voxel=list(cached_image['voxel'].values()))
            select_size = int(request.POST.get('select_size'))
            bead_extractor.selectionFrameHalf = select_size / 2
            bead_coords = request.POST.get('bead_coords')
            bead_coords = eval(bead_coords)
            bead_extractor._beadCoords = bead_coords
            bead_extractor._extractedBeads = None
            bead_extractor.MarkedBeadsExtract()

            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead', 'blur_type'], [bead_extractor, cached_image, bead_extractor._beadCoords, bead_extractor._extractedBeads, bead_extractor._selectionFrameHalf, bead_extractor._averageBead, 'none'])
            extracted_beads_list = []
            if bead_extractor._extractedBeads: 
                for index, extracted_bead in enumerate(bead_extractor._extractedBeads):
                    tiff_image = save_as_tiff(image_raw=extracted_bead, is_one_page=True, filename=f"extracted_bead_{index}.tiff", outtype="uint8")
                    image_byte_stream, buf = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=True)
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
            print("Bead was averaged")
            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead', 'blur_type'], [bead_extractor, django_cache.get('bead_extractor')['beads_image'], django_cache.get('bead_extractor')['bead_coords'], django_cache.get('bead_extractor')['extract_beads'], django_cache.get('bead_extractor')['select_frame_half'], bead_extractor._averageBead, request.POST.get('blur_type')])
            avg_bead = django_cache.get('bead_extractor')['average_bead']
            img_projection = generate_projections(avg_bead)

            if isinstance(avg_bead, ImageRaw):
                tiff_image = save_as_tiff(image_raw=avg_bead, is_one_page=False, filename=f"average_bead.tiff", outtype="uint8")
                avg_bead_show, avg_bead_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
                response_data = {
                        'message': 'Bead averaging successfully',
                        'average_bead_show': avg_bead_show,
                        'average_bead_save': avg_bead_save,
                        'img_projection': img_projection  
                    }
                return JsonResponse(response_data)
            else:
                return error_response(400, 'Invalid image data. Unable to save as TIFF.', 'POST')
        except Exception as e:
            return error_response(400, str(e), 'POST')
    else:
        return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


@csrf_exempt
def get_average_bead(request):
    try:
        avg_bead_cache = django_cache.get('bead_extractor')['average_bead']
        if isinstance(avg_bead_cache, ImageRaw):
            tiff_image = save_as_tiff(image_raw=avg_bead_cache, is_one_page=False, filename="average_bead.tiff", outtype="uint8")
            avg_bead_show, avg_bead_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            img_projection = generate_projections(avg_bead_cache)
            response_data = {
                'message': 'Average bead data retrieved successfully',
                'average_bead_show': avg_bead_show,  
                'average_bead_save': avg_bead_save,
                'voxel': avg_bead_cache.voxel,
                'img_projection': img_projection  
            }
            return JsonResponse(response_data)
        else:
            return JsonResponse({'error': 'Invalid image data in cache. Unable to process.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def psf_extract(request):
    if request.method == 'POST' and request.POST.get('beadSize') and request.POST.get('iter') and request.POST.get('regularization') and request.POST.get('deconvMethod'):
        try:
            psf_extractor = DeconPsfModel()
            cached_image = django_cache.get('bead_extractor')['average_bead']
            if cached_image is not None:
                psf_extractor.SetPSFImage(array=cached_image.imArray, voxel=list(cached_image.voxel.values()))
                psf_extractor.iterationNumber = request.POST.get('iter')
                psf_extractor.regularizationParameter = request.POST.get('regularization')
                psf_extractor.beadDiameter = request.POST.get('beadSize')
                psf_extractor.CalculatePSF(request.POST.get('deconvMethod'), None, None)
                print('Result of PSF: ', psf_extractor.resultImage, psf_extractor._resultImage)
                pass2cache('psf_extractor', ['extractor', 'iter', 'regularization', 'psf'], [psf_extractor, request.POST.get('iter'), request.POST.get('regularization'), psf_extractor.resultImage])
                tiff_image = save_as_tiff(image_raw=psf_extractor.resultImage, is_one_page=False, filename=f"extracted_psf.tiff", outtype="uint8")
                psf_show, psf_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
                img_projection = generate_projections(psf_extractor.resultImage)
                response_data = {
                    'message': 'PSF extracted successfully',
                    'extracted_psf_show': psf_show,
                    'extracted_psf_save': psf_save,
                    'img_projection': img_projection
                }
                return JsonResponse(response_data)
            else:
                return error_response(400, 'Cached image is None.', 'POST')
        except Exception as e:
            return error_response(400, str(e), 'POST')
    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')



@csrf_exempt
def get_psf(request):
    try:
        psf_cache = django_cache.get('psf_extractor')['psf']
        if isinstance(psf_cache, ImageRaw):
            tiff_image = save_as_tiff(image_raw=psf_cache, is_one_page=False, filename="average_bead.tiff", outtype="uint8")
            psf_show, psf_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            img_projection = generate_projections(psf_cache)
            response_data = {
                'message': 'PSF data retrieved successfully',
                'psf_show': psf_show,  
                'psf_save': psf_save,
                'resolution': psf_cache.imArray.shape,
                'voxel': psf_cache.voxel,
                'img_projection': img_projection
            }
            return JsonResponse(response_data)
        else:
            return JsonResponse({'error': 'Invalid image data in cache. Unable to process.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
def get_voxel(request):
    try:
        psf_cache = django_cache.get('psf_extractor')['psf']
        if isinstance(psf_cache, ImageRaw):
            response_data = {
                'message': 'Voxel retrieved successfully',
                'voxel': psf_cache.voxel  
            }
            return JsonResponse(response_data)
        else:
            return JsonResponse({'error': 'Invalid image data in cache. Unable to process.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
def deconvolve_image(request):
    if request.method == 'POST' and request.POST.get('iter') and request.POST.get('regularization') and request.POST.get('deconvMethod'):
        try:
            deconvolver = DeconImageModel()
            psf_cache = django_cache.get('psf_extractor')['psf']
            deconvolver._deconPsf = psf_cache
            print(f"Decon PSF: {deconvolver._deconPsf}")
            source_img = django_cache.get('source_img')
            deconvolver.SetDeconImage(array=source_img['imArray'], voxel=list(source_img['voxel'].values()))
            print(f"Decon img: {deconvolver._deconImage}")
            # deconvolver.SetDeconImage(array=source_img['imArray'], voxel=list(source_img['voxel'].values()))
            deconvolver.iterationNumber = request.POST.get('iter')
            deconvolver.regularizationParameter = request.POST.get('regularization')
            deconvolver.DeconvolveImage(request.POST.get('deconvMethod'), None, None)
            print(f"Result: {deconvolver._deconResult}")
            pass2cache('deconvolution', ['deconvolver', 'psf', 'source_img', 'iter', 'regularization', 'result'], [deconvolver, psf_cache, source_img, request.POST.get('iter'), request.POST.get('regularization'), deconvolver._deconResult])

            tiff_image = save_as_tiff(image_raw=deconvolver._deconResult, is_one_page=False, filename=f"result_deconv.tiff", outtype="uint8")
            deconv_show, deconv_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            img_projection = generate_projections(deconvolver._deconResult)
            response_data = {
                'message': 'Image was deconvolved successfully',
                'deconv_show': deconv_show,
                'deconv_save': deconv_save,
                'img_projection': img_projection
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')


@csrf_exempt
def preprocess_image(request):
    # check if request contains all requiered data 
    if request.method == 'POST' and request.POST.get('isNeedGaussBlur') and request.POST.get('gaussBlurRad') and request.POST.get('isNeedMaxIntensity'):
        try:
            preprocessor = PreprocessImageModel()
            
            source_img = django_cache.get('source_img')
            preprocessor.SetPreprocImage(array=source_img['imArray'], voxel=list(source_img['voxel'].values()))
            print(f"Preprocess img: {preprocessor._preprocImage}")
            
            preprocessor.gaussBlurRad = request.POST.get('gaussBlurRad')
            preprocessor.isNeedGaussBlur = request.POST.get('isNeedGaussBlur')
            preprocessor.isNeedMaximizeIntensity = request.POST.get('isNeedMaxIntensity')

            preprocessor.PreprocessImage(None, None)

            print(f"Result: {preprocessor._preprocResult}")
            img_projection = generate_projections(preprocessor._preprocResult)
            pass2cache('preprocessing', ['preprocessor', 'source_img', 'gaussBlurRad', 'isNeedGaussBlur', 'isNeedMaxIntensity', 'preprocessed_img'], [preprocessor, source_img, request.POST.get('gaussBlurRad'), request.POST.get('isNeedGaussBlur'), request.POST.get('isNeedMaxIntensity'), preprocessor._preprocResult])

            tiff_image = save_as_tiff(image_raw=preprocessor._preprocResult, is_one_page=False, filename=f"result_preproc.tiff", outtype="uint8")
            preproc_show, preproc_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            response_data = {
                'message': 'Image preprocessed successfully',
                'preproc_show': preproc_show,
                'preproc_save': preproc_save,
                'img_projection': img_projection
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')

@csrf_exempt
def cnn_deconv_image(request):
    if request.method == 'POST':
        try:
            deconvolver = CNNDeconvModel()
            preprocessed_img = django_cache.get('preprocessing')['preprocessed_img']
            print(f"preprocessed_img: {preprocessed_img}")
            
            deconvolver.SetDeconImage(array=preprocessed_img.imArray, voxel=[0.1,0.02,0.05])
            print(f"Decon img: {deconvolver._deconImage}")
            
            deconvolver.DeconvolveImage(None, None)
            print(f"Result: {deconvolver._deconResult}")
            img_projection = generate_projections(deconvolver._deconResult)
            pass2cache('cnn_deconv', ['deconvolver', 'preprocessed_img', 'result'], [deconvolver, preprocessed_img, deconvolver._deconResult])

            tiff_image = save_as_tiff(image_raw=deconvolver._deconResult, is_one_page=False, filename=f"result_deconv.tiff", outtype="uint8")
            deconv_show, deconv_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            response_data = {
                'message': 'Image was CNN deconvolved successfully',
                'deconv_show': deconv_show,
                'deconv_save': deconv_save,
                'img_projection': img_projection
            }

            return JsonResponse(response_data)
        except Exception as e:
            return error_response(400, str(e), 'POST')

    return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')

def hello_world(request):
    return HttpResponse("Hello, world!")
