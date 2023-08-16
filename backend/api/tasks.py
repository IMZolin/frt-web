from celery import shared_task
import os
import numpy as np
from django.core.cache import cache as django_cache
from engine.engine_lib.src.model.ImageRaw_class import ImageRaw
from engine.engine_lib.src.model.extractor_model import ExtractorModel
from .utils import pass2cache


@shared_task
def load_and_cache_image(file_paths, image_type, voxelX=None, voxelY=None, voxelZ=None):
    pass
    """
    try:
        # Add this line before attempting to open the files
        print("File paths to be opened:", file_paths)

        # Check if the files exist before opening
        for file_path in file_paths:
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                raise ValueError(f"File not found: {file_path}")

        # Modify the line that opens the files to include error handling
        try:
            file_list = [open(file_path, 'rb') for file_path in file_paths]
        except FileNotFoundError as e:
            print("Error opening file:", e)
            raise ValueError("Error opening one or more files")

        # Load the image data
        if voxelX is not None and voxelY is not None and voxelZ is not None:
            voxel = np.array([float(voxelZ), float(voxelY), float(voxelX)])
            image_data = ImageRaw(fpath=file_list, voxelSizeIn=voxel)
        else:
            image_data = ImageRaw(fpath=file_list)

        pass2cache(image_type, ['imArray', 'voxel'], [image_data.imArray, image_data.voxel])
        resolution = image_data.imArray.shape  # Get the resolution of the image

        # Close the file handles after processing
        for file_obj in file_list:
            file_obj.close()

        return resolution
    except ValueError as e:
        raise ValueError(str(e))
    """