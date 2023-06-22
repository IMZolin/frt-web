from django.shortcuts import render
from PIL import Image
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import ImageParams, ImageWrapper, PSFParams, DeconvParams, CNNParams
from django.core.cache import cache
import logging

from engine.file_input import ReadTiffStackFile, SaveTiffStack
from engine.main import process_cnn, process_deconv, process_psf
# Create your views here.

logger = logging.getLogger(__name__)

@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        image = Image.open(file)
        image_data = ReadTiffStackFile(file)
        image_params = ImageParams(ncols=image_data[0], nrows=image_data[1], nlayers=image_data[2], img_array=image_data[3])
        image_wrapper = ImageWrapper(file_name=file.name, data=image_params, data_view=ImageWrapper._image_to_base64(image))
        cache_key = 'start_image'
        cache.set(cache_key, image_wrapper)
        response_data = {
            'message': 'Image loaded successfully',
            'image': image_wrapper.to_json(),
            # Include any other relevant data or results
        }
        response = JsonResponse(response_data)
        response["Access-Control-Allow-Origin"] = "*"  # Allow requests from any origin
        response["Access-Control-Allow-Methods"] = "POST"  # Allow only POST requests
        logger.info('Response data: %s', response_data['message'])  # Log response_data
        return response

    error_response = {
        'error': 'Invalid request. Please make a POST request with a file.'
    }
    response = JsonResponse(error_response, status=400)
    response["Access-Control-Allow-Origin"] = "*"  # Allow requests from any origin
    response["Access-Control-Allow-Methods"] = "POST"  # Allow only POST requests
    logger.info('Error response: %s', error_response['error'])  # Log error_response
    return response

@csrf_exempt
def psf_processing(request):
    if request.method == 'POST':
        bead_size = request.POST.get('bead_size')
        resolution_xy = request.POST.get('resolution_xy')
        resolution_z = request.POST.get('resolution_z')
        iter_num = request.POST.get('iter_num')
        
        if bead_size and resolution_xy and resolution_z or iter_num:
            cached_object = cache.get('start_image')
            psf_param = PSFParams(start_image=cached_object, bead_size=bead_size, resolution_xy=resolution_xy, resolution_z=resolution_z, iter_num=iter_num)
            cache_key = 'psf_param'
            cache_object = psf_param
            cache.set(cache_key, cache_object)
            processed_image = process_psf(psf_param)
            psf_param.set_result(processed_image)
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
            if psf_param:   
                deconv_param = DeconvParams(iter_num=iter_num, psf_param=psf_param)
                cache_key = 'deconv_param'
                cache_object = deconv_param
                cache.set(cache_key, cache_object)
                processed_image = process_deconv(deconv_param)
                deconv_param.set_result(processed_image)
                response_data = {
                    'message': 'Deconvolution parameters received successfully',
                    'deconv_param': deconv_param.to_json(),
                    # Include any other relevant data or results
                }
                return JsonResponse(response_data)
            else:
                error_response = {
                'error': 'Invalid request. First you need to run PSF'
            }
            return JsonResponse(error_response, status=400)
        else:
            error_response = {
                'error': 'Invalid request. Please provide any Deconvolution parameters'
            }
            return JsonResponse(error_response, status=400)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with all Deconvolution parameters'
    }
    return JsonResponse(error_response, status=400)


@csrf_exempt
def cnn_processing(request):
    if request.method == 'POST':
        maximize_intensity = request.POST.get('maximize_intensity')
        gaussian_blur = request.POST.get('gaussian_blur')

        if maximize_intensity or gaussian_blur:
            cached_object = cache.get('start_image')
            cnn_param = CNNParams(start_image=cached_object, maximize_intensity=maximize_intensity, gaussian_blur=gaussian_blur)
            processed_image = process_cnn(cnn_param)
            cnn_param.set_result(processed_image)
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
