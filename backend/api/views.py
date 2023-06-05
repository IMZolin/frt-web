from django.shortcuts import render
import numpy as np
from PIL import Image
from django.http import JsonResponse
from django.http import HttpResponse
# Create your views here.

def load_image(request):
    if request.method == 'POST':
        file = request.FILES.get('file')  # Assuming the uploaded file is passed as 'file' parameter
        if file:
            try:
                image_tiff = Image.open(file)
                ncols, nrows = image_tiff.size
                nlayers = image_tiff.n_frames
                img_array = np.ndarray([nlayers, nrows, ncols], dtype=np.uint8)
                for i in range(nlayers):
                    image_tiff.seek(i)
                    img_array[i, :, :] = np.array(image_tiff)
                return JsonResponse({'message': 'Image loaded successfully', 'image': img_array.tolist()})
            except Exception as e:
                return JsonResponse({'error': 'Error loading image', 'message': str(e)})
        else:
            return JsonResponse({'error': 'File not found'})
    else:
        return JsonResponse({'error': 'Invalid request method'})
    

def hello_world(request):
    return HttpResponse("Hello, world!")
