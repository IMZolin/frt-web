import os
import numpy as np
import logging
import tempfile
from memory_profiler import profile
from celery import shared_task
from django.core.cache import cache as django_cache
from engine.engine_lib.src.model.ImageRaw_class import ImageRaw
from .utils import save_as_tiff, pil_image_to_byte_stream, pass2cache, generate_projections

# Set up logger
logger = logging.getLogger(__name__)

# Cache timeout in seconds (e.g., 30 minutes)
CACHE_TIMEOUT = 1800

# Create a temporary file for memory profiling logs
temp_log_file = tempfile.NamedTemporaryFile(delete=False, suffix='.log')
temp_log_file_path = temp_log_file.name
temp_log_file.close()  # Close the file so it can be used later

@shared_task
@profile(stream=open(temp_log_file_path, 'w+'))
def process_image_task(file_paths, image_type, voxelX=None, voxelY=None, voxelZ=None):
    try:
        # Check if the files exist before opening
        file_list = [open(file_path, 'rb') for file_path in file_paths]

        # Load the image data
        if voxelX is not None and voxelY is not None and voxelZ is not None:
            voxel = np.array([float(voxelZ), float(voxelY), float(voxelX)])
            image_data = ImageRaw(fpath=file_list, voxelSizeIn=voxel)
        else:
            image_data = ImageRaw(fpath=file_list)

        pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])

        if image_type in ['averaged_bead', 'extracted_psf']:
            tiff_image = save_as_tiff(image_raw=image_data, is_one_page=False, filename=f"{image_type}.tiff",
                                      outtype="uint8")
            multi_layer_show, multi_layer_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            img_projection = generate_projections(tiff_image)
        else:
            tiff_image = save_as_tiff(image_raw=image_data, is_one_page=False, filename=f"{image_type}.tiff",
                                      outtype="uint8")
            multi_layer_show, multi_layer_save = pil_image_to_byte_stream(pil_image=tiff_image, is_one_page=False)
            img_projection = None

        # Close the file handles after processing
        for file_obj in file_list:
            file_obj.close()

        response_data = {
            'message': f'Image {image_type} processed successfully',
            'img_projection': img_projection,
            'multi_layer_show': multi_layer_show,
            'multi_layer_save': multi_layer_save
        }
        return response_data
    except Exception as e:
        return {'error': str(e)}
