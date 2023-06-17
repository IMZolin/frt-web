from django.shortcuts import render
import numpy as np
import base64
from PIL import Image
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Image, PSFParameters, DeconvolutionParameters, CNNParameters
from django.core.cache import cache

from engine.cnn_engine import process_cnn
# Create your views here.

@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        image = Image(file_name=file.name, data=file.read())
        cache_key = 'start_image'
        cache_object = {
            'file_name': image.file_name,
            'data': base64.b64encode(image.data).decode('utf-8')
        }
        cache.set(cache_key, cache_object)
        response_data = {
            'message': 'Image loaded successfully',
            'image': image.to_json(),
            'file_size': str(len(image.data)) + ' bytes',
            # Include any other relevant data or results
        }
        return JsonResponse(response_data)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with a file.'
    }
    return JsonResponse(error_response, status=400)
    

@csrf_exempt
def psf_processing(request):
    if request.method == 'POST':
        bead_size = request.POST.get('bead_size')
        resolution_xy = request.POST.get('resolution_xy')
        resolution_z = request.POST.get('resolution_z')
        iter_num = request.POST.get('iter_num')
        
        if bead_size and resolution_xy and resolution_z or iter_num:
            cached_object = cache.get('start_image')
            psf_param = PSFParameters(start_image=cached_object, bead_size=bead_size, resolution_xy=resolution_xy, resolution_z=resolution_z, iter_num=iter_num)
            cache_key = 'psf_param'
            cache_object = psf_param
            cache.set(cache_key, cache_object)
            response_data = {
                'message': 'PSF parameters received successfully',
                'psf_parameters': psf_param.to_json(),
                # Include any other relevant data or results
            }
            return JsonResponse(response_data)
        else:
            error_response = {
                'error': 'Invalid request. Please provide all PSF parameters'
            }
            return JsonResponse(error_response, status=400)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with all PSF parameters'
    }
    return JsonResponse(error_response, status=400)


@csrf_exempt
def deconv_processing(request):
    if request.method == 'POST':
        iter_num = request.POST.get('iter_num')
        
        if iter_num:
            psf_param = cache.get('psf_param')
            deconv_param = DeconvolutionParameters(iter_num=iter_num, psf_param=psf_param)
            cache_key = 'deconv_param'
            cache_object = deconv_param
            cache.set(cache_key, cache_object)
            response_data = {
                'message': 'Deconvolution parameters received successfully',
                'deconv_param': deconv_param.to_json(),
                # Include any other relevant data or results
            }
            return JsonResponse(response_data)
        else:
            error_response = {
                'error': 'Invalid request. Please provide any Deconvolution parameters'
            }
            return JsonResponse(error_response, status=400)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with all PSF parameters'
    }
    return JsonResponse(error_response, status=400)


@csrf_exempt
def cnn_processing(request):
    if request.method == 'POST':
        maximize_intensity = request.POST.get('maximize_intensity')
        gaussian_blur = request.POST.get('gaussian_blur')

        if maximize_intensity or gaussian_blur:
            cached_object = cache.get('start_image')
            cnn_param = CNNParameters(start_image=cached_object, maximize_intensity=maximize_intensity, gaussian_blur=gaussian_blur)
            processed_image = process_cnn(cnn_param)
            cnn_param.set_results(processed_image)
            response_data = {
                'message': 'CNN parameters received successfully',
                'cnn_parameters': cnn_param.to_json(),
                # Include any other relevant data or results
            }
            return JsonResponse(response_data)
        else:
            error_response = {
                'error': 'Invalid request. Please provide any CNN parameters'
            }
            return JsonResponse(error_response, status=400)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with any CNN parameters'
    }
    return JsonResponse(error_response, status=400)
    

def hello_world(request):
    return HttpResponse("Hello, world!")
