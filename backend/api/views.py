from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache as django_cache
import logging
import numpy as np

from engine.engine_lib.src.ImageRaw_class import ImageRaw
# Create your views here.

logger = logging.getLogger(__name__)

def error_response(error_code, message_error, type_request):
    if 'voxel' in message_error:
        error_response = {
            'error': message_error
        }
    else:
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
    if request.method == 'POST' and request.FILES.getlist('file'):
        file_list = request.FILES.getlist('file')
        print('Received files:', file_list)
        try:
            image_data = ImageRaw(fpath=file_list)

            image_dict = {
                'imArray': image_data.imArray,
                'voxel': image_data.voxel
            }
            cache_key = 'beads_image'
            django_cache.set(cache_key, image_dict, timeout=None)

            return HttpResponse('Image loaded successfully')
        except ValueError as e:
            if 'voxel' in str(e) and request.POST.get('voxelX') and request.POST.get('voxelY') and request.POST.get('voxelZ'):
                voxelX = float(request.POST.get('voxelX'))
                voxelY = float(request.POST.get('voxelY'))
                voxelZ = float(request.POST.get('voxelZ'))
                voxel = np.array([voxelZ, voxelY, voxelX])
                try:
                    image_data = ImageRaw(fpath=file_list, voxelSizeIn=voxel)
                    
                    image_dict = {
                        'imArray': image_data.imArray,
                        'voxel': image_data.voxel
                    }
                    cache_key = 'beads_image'
                    django_cache.set(cache_key, image_dict, timeout=None)

                    return HttpResponse('Image loaded successfully')
                except ValueError as ve:
                    return error_response(400, str(ve), 'POST')
            else:
                return error_response(400, str(e), 'POST')
    else:
        return error_response(400, 'Invalid request. Please make a POST request with a file.', 'POST')


@csrf_exempt
def bead_extract(request):
    pass


@csrf_exempt
def bead_avearage(request):
    pass

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
