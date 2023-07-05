from django.shortcuts import render
import numpy as np
from PIL import Image
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import ImageParams, ImageWrapper, PSFParams, DeconvParams, CNNParams
from django.core.cache import cache as django_cache
import logging
from io import BytesIO

from engine.engine_lib.src.file_inout import ReadTiffStackFile
from engine.engine_lib.src.ImageRaw_class import ImageRaw
from engine.main import process_cnn, process_deconv, process_psf
# Create your views here.

logger = logging.getLogger(__name__)


@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.getlist('file'):
        file_list = request.FILES.getlist('file')
        image_data = ImageRaw(fpath=file_list)
        image_params = ImageParams(image_data)  # Create an instance of ImageParams

        # Store image_data in cache
        cache_key_data = 'beads_image_data'
        django_cache.set(cache_key_data, image_params, timeout=None)

        # # Convert image_params to bytes
        # image_bytes = image_params.to_bytes()

        # # Store the bytes in BytesIO
        # file_io = BytesIO(image_bytes)

        # Store the BytesIO object in cache
        # cache_key = 'beads_image'
        # django_cache.set(cache_key, ), timeout=None)

        logger.info('Image loaded successfully')

        return HttpResponse('Image loaded successfully')
    else:
        error_response = {
            'error': 'Invalid request. Please make a POST request with a file.'
        }
        response = JsonResponse(error_response, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST"
        logger.info('Error response: %s', error_response['error'])
        return response





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
