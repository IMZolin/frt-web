from django.shortcuts import render
import numpy as np
import requests
from PIL import Image
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Image, Task
from engine.file_input import ReadTiffStackFile
# Create your views here.

@csrf_exempt
def load_image(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        image = Image(file_name=file.name)
        image.name = file.name
        image.data = file.read()
        task = Task(start_image=image)

        response_data = {
            'message': 'Image loaded and task created successfully',
            'file_name': image.name,
            'file_size': str(len(image.data)) + ' bytes',
            # Include any other relevant data or results
        }
        return JsonResponse(response_data)
    
    error_response = {
        'error': 'Invalid request. Please make a POST request with a file.'
    }
    return JsonResponse(error_response, status=400)
    
    

def hello_world(request):
    return HttpResponse("Hello, world!")
