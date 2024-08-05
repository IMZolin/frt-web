import json
import os
from typing import Tuple, Union

import numpy as np

from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine_supporter import generate_projections
from web.backend.file_manager.file_handler import MAX_CACHE_SIZE, tiff2list, tiff2bytes
from web.backend.file_manager.redis_manager import pass2cache, get_cache_data
from web.backend.file_manager.s3_client import s3_client


async def set_response(image: ImageRaw, get_projections: bool, get_compressed: bool = True) -> dict:
    try:
        if image is None:
            raise Exception("Image is None")
        image_tiff = image.SaveAsTiff()
        if get_compressed:
            images_show = await tiff2list(image=image_tiff)
        else:
            images_show = await tiff2bytes(image=image_tiff)
        response_content = {
            'image_show': images_show,
            'dimensions': image.GetImageShape()
        }
        if get_projections:
            response_content['projections'] = generate_projections(image)
        return response_content
    except Exception as e:
        raise Exception(f"Error in set_response: {e}")


async def save_result(image: ImageRaw, image_type: str):
    try:
        image_intensities = np.array(image.GetIntensities())
        voxel = image.GetVoxel()
        if image_intensities.size < MAX_CACHE_SIZE:
            cache_data = {
                'is_cache_size': True,
                'image_intensities': image_intensities.tolist(),
                'voxel': voxel
            }
        else:
            await save_cloud(save_path=f'{image_type}', img_array=image_intensities, voxel=voxel)
            cache_data = {'is_cache_size': False}
        pass2cache(image_type, cache_data)
    except Exception as e:
        raise Exception(f"Error in save_result: {e}")


async def save_cloud(save_path: str, img_array: np.ndarray, voxel: list):
    try:
        await s3_client.head_bucket()
        np.save('/tmp/img_array.npy', img_array)
        np.save('/tmp/voxel.npy', np.array(voxel))
        await s3_client.upload_file('/tmp/img_array.npy', f'{save_path}/img_array.npy')
        await s3_client.upload_file('/tmp/voxel.npy', f'{save_path}/voxel.npy')

    except Exception as e:
        raise Exception(f"Error in save_cloud: {e}")
    finally:
        if os.path.exists('/tmp/img_array.npy'):
            os.remove('/tmp/img_array.npy')
        if os.path.exists('/tmp/voxel.npy'):
            os.remove('/tmp/voxel.npy')


async def read_cloud(save_path: str) -> Tuple[np.ndarray, list]:
    try:
        await s3_client.head_bucket()
        img_array_path = f'{save_path}/img_array.npy'
        voxel_path = f'{save_path}/voxel.npy'
        await s3_client.download_file(img_array_path, '/tmp/img_array.npy')
        await s3_client.download_file(voxel_path, '/tmp/voxel.npy')
        img_array = np.load('/tmp/img_array.npy')
        voxel = np.load('/tmp/voxel.npy').tolist()
        return img_array, voxel
    except Exception as e:
        raise Exception(f"Error in read_cloud: {e}")
    finally:
        if os.path.exists('/tmp/img_array.npy'):
            os.remove('/tmp/img_array.npy')
        if os.path.exists('/tmp/voxel.npy'):
            os.remove('/tmp/voxel.npy')


async def clear_cloud(image_type: str):
    try:
        await s3_client.head_bucket()
        img_array_path = f'{image_type}/img_array.npy'
        voxel_path = f'{image_type}/voxel.npy'
        await s3_client.delete_file(img_array_path)
        await s3_client.delete_file(voxel_path)
    except Exception as e:
        raise Exception(f"Error in clear_cloud: {e}")


async def handle_image(image_type: str) -> Union[ImageRaw, str]:
    try:
        cache_data = await get_cache_data(image_type)
        if not cache_data:
            return 'Cache miss'
        is_cache_size = cache_data.get('is_cache_size') == 'True'
        if is_cache_size:
            img_array = np.array(json.loads(cache_data.get('image_intensities')))
            voxel = json.loads(cache_data.get('voxel'))
        else:
            img_array, voxel = await read_cloud(save_path=image_type)
        if img_array is not None and voxel is not None:
            return ImageRaw(intensitiesIn=img_array, voxelSizeIn=voxel)
        else:
            return 'Error in read cloud/cache'
    except Exception as e:
        raise Exception(f"Error in handle image: {e}")


async def get_source_img():
    try:
        noisy_img = await handle_image('source_img')
        denoised_img = await handle_image('denoised_img')
        if noisy_img is None and denoised_img is None:
            raise Exception("The source image not found in the cache. Maybe the time is up. Upload it again.")
        elif denoised_img is not None:
            return denoised_img
        elif noisy_img is not None:
            return noisy_img
        else:
            raise Exception("Source image is None")
    except Exception as e:
        raise Exception(f"Error in get_source_img: {e}")
