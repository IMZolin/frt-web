import base64
import io
import os
from typing import List

from PIL import Image
from fastapi import UploadFile

CHUNK_SIZE = 1024 * 1024
COMPRESS_QUALITY = 50
MAX_CACHE_SIZE = 500000


async def save_files(files: List[UploadFile], temp_dir: str):
    try:
        file_paths = []
        for file in files:
            temp_file = os.path.join(temp_dir, file.filename)
            with open(temp_file, "wb") as f:
                while content := await file.read(CHUNK_SIZE):
                    f.write(content)
            file_paths.append(temp_file)
        return file_paths
    except Exception as e:
        raise Exception(f"Error in save_files: {e}")


async def tiff2list(image):  # list of compressed image layers
    try:
        base64_list = []
        for layer in image:
            byte_stream = io.BytesIO()
            layer.save(byte_stream, format='TIFF', quality=COMPRESS_QUALITY)
            byte_stream.seek(0)
            base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
            base64_list.append(base64_string)
        return base64_list
    except Exception as e:
        raise Exception(f"Error in tiff2byte_list: {e}")


async def tiff2bytes(image):  # original multi-layer image
    try:
        byte_stream2 = io.BytesIO()
        image[0].save(byte_stream2, format='TIFF', save_all=True, append_images=image[1:])
        byte_stream2.seek(0)
        base64_string = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
        return base64_string
    except Exception as e:
        raise Exception(f"Error in tiff2bytes: {e}")


async def list2tiff(base64_list: List[str]) -> str:
    try:
        images = []
        for base64_string in base64_list:
            image_data = base64.b64decode(base64_string)
            byte_stream = io.BytesIO(image_data)
            image = Image.open(byte_stream)
            images.append(image)
        byte_stream = io.BytesIO()
        images[0].save(byte_stream, format='TIFF', save_all=True, append_images=images[1:])
        byte_stream.seek(0)
        base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
        return base64_string
    except Exception as e:
        raise Exception(f"Error in list2tiff: {e}")
