from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache as django_cache
import logging
import numpy as np
import tifffile

from engine.engine_lib.src.model.ImageRaw_class import ImageRaw
from engine.engine_lib.src.model.extractor_model import ExtractorModel

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

def pass2cache(cache_key, key, data):
    cache_dict = dict(zip(key, data))
    django_cache.set(cache_key, cache_dict, timeout=None)


@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.getlist('file') and request.POST.get('image_type'):
        file_list = request.FILES.getlist('file')
        image_type = str(request.POST.get('image_type'))
        try:
            image_data = ImageRaw(fpath=file_list)
            pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])
            return HttpResponse('Image loaded successfully')
        except ValueError as e:
            if 'voxel' in str(e) and request.POST.get('voxelX') and request.POST.get('voxelY') and request.POST.get('voxelZ'):
                voxelX = float(request.POST.get('voxelX'))
                voxelY = float(request.POST.get('voxelY'))
                voxelZ = float(request.POST.get('voxelZ'))
                voxel = np.array([voxelZ, voxelY, voxelX])
                try:
                    image_data = ImageRaw(fpath=file_list, voxelSizeIn=voxel)
                    pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])
                    return HttpResponse('Image loaded successfully')
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
            is_deleted_beads = bool(request.POST.get('is_deleted_beads'))

            if is_deleted_beads:
                bead_extractor.extractedBeads = []
                bead_extractor.MarkedBeadsExtract()
                is_deleted_beads = False
            else:
                bead_extractor.MarkedBeadsExtract()

            pass2cache('bead_extractor', ['data', 'beads_image', 'bead_coords', 'extract_beads', 'select_frame_half', 'average_bead','is_deleted_beads', 'blur_type'], [bead_extractor, cached_image, bead_extractor._beadCoords, bead_extractor._extractedBeads, bead_extractor._selectionFrameHalf, bead_extractor._averageBead, False, 'none'])

            print(django_cache.get('bead_extractor'))
            return HttpResponse('Beads extracting successfully')
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

            print(django_cache.get('bead_extractor')['average_bead'].imArray)
            return HttpResponse('Bead averaging successfully')
        except Exception as e:
            return error_response(400, str(e), 'POST')
    else:
        return error_response(400, 'Invalid request. Please make a POST request with the required parameters.', 'POST')



# @csrf_exempt
# def psf_processing(request):
#     if request.method == 'POST':
#         bead_size = request.POST.get('bead_size')
#         resolution_xy = request.POST.get('resolution_xy')
#         resolution_z = request.POST.get('resolution_z')
#         deconv_method = request.POST.get('deconv_method')
#         iter_num = request.POST.get('iter_num')
#         regularization = request.POST.get('regularization')
        
#         if bead_size and resolution_xy and resolution_z or iter_num:
#             cached_object = cache.get('start_image')
#             psf_param = PSFParams(start_image=cached_object, bead_size=bead_size, resolution_xy=resolution_xy, resolution_z=resolution_z, iter_num=iter_num)
#             cache_key = 'psf_param'
#             cache_object = psf_param
#             cache.set(cache_key, cache_object)
#             processed_image = process_psf(psf_param)
#             psf_param.set_result(processed_image)
#             response_data = {
#                 'message': 'PSF parameters received successfully',
#                 'psf_parameters': psf_param.to_json(),
#                 # Include any other relevant data or results
#             }
#             return JsonResponse(response_data)
#         else:
#             error_response = {
#                 'error': 'Invalid request. Please provide all PSF parameters'
#             }
#             return JsonResponse(error_response, status=400)
    
#     error_response = {
#         'error': 'Invalid request. Please make a POST request with all PSF parameters'
#     }
#     return JsonResponse(error_response, status=400)


# @csrf_exempt
# def deconv_processing(request):
#     if request.method == 'POST':
#         iter_num = request.POST.get('iter_num')
#         if iter_num:
#             psf_param = cache.get('psf_param')
#             if psf_param:   
#                 deconv_param = DeconvParams(iter_num=iter_num, psf_param=psf_param)
#                 cache_key = 'deconv_param'
#                 cache_object = deconv_param
#                 cache.set(cache_key, cache_object)
#                 processed_image = process_deconv(deconv_param)
#                 deconv_param.set_result(processed_image)
#                 response_data = {
#                     'message': 'Deconvolution parameters received successfully',
#                     'deconv_param': deconv_param.to_json(),
#                     # Include any other relevant data or results
#                 }
#                 return JsonResponse(response_data)
#             else:
#                 error_response = {
#                 'error': 'Invalid request. First you need to run PSF'
#             }
#             return JsonResponse(error_response, status=400)
#         else:
#             error_response = {
#                 'error': 'Invalid request. Please provide any Deconvolution parameters'
#             }
#             return JsonResponse(error_response, status=400)
    
#     error_response = {
#         'error': 'Invalid request. Please make a POST request with all Deconvolution parameters'
#     }
#     return JsonResponse(error_response, status=400)


# @csrf_exempt
# def cnn_processing(request):
#     if request.method == 'POST':
#         maximize_intensity = request.POST.get('maximize_intensity')
#         gaussian_blur = request.POST.get('gaussian_blur')

#         if maximize_intensity or gaussian_blur:
#             cached_object = cache.get('start_image')
#             cnn_param = CNNParams(start_image=cached_object, maximize_intensity=maximize_intensity, gaussian_blur=gaussian_blur)
#             processed_image = process_cnn(cnn_param)
#             cnn_param.set_result(processed_image)
#             response_data = {
#                 'message': 'CNN parameters received successfully',
#                 'cnn_parameters': cnn_param.to_json(),
#                 # Include any other relevant data or results
#             }
#             return JsonResponse(response_data)
#         else:
#             error_response = {
#                 'error': 'Invalid request. Please provide any CNN parameters'
#             }
#             return JsonResponse(error_response, status=400)
    
#     error_response = {
#         'error': 'Invalid request. Please make a POST request with any CNN parameters'
#     }
#     return JsonResponse(error_response, status=400)
    

def hello_world(request):
    return HttpResponse("Hello, world!")
