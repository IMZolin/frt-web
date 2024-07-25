import base64
import io
import json
import os
from typing import Union, List, Tuple

import aioboto3
from botocore.exceptions import ClientError
import numpy as np
import redis
from fastapi import UploadFile

from config import settings
from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
TIMEOUT = 600
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
        base64_string2 = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
        return base64_string2
    except Exception as e:
        raise Exception(f"Error in tiff2bytes: {e}")


async def tiff2base64(image, is_compress=True):
    try:
        if is_compress:
            return await tiff2list(image)
        else:
            return await tiff2bytes(image)
    except Exception as e:
        raise Exception(f"Error in tiff2base64: {e}")


def generate_projections(image_raw):
    try:
        img_buf = io.BytesIO()
        projections = AuxCanvasPlot.FigurePILImagekFrom3DArray(image_raw.GetIntensities())
        if projections is None:
            return None
        projections.save(img_buf, format='TIFF')
        img_buf.seek(0)
        base64_string = base64.b64encode(img_buf.getvalue()).decode('utf-8')
        return [base64_string]
    except Exception as e:
        raise Exception(f"Error in generate_projections: {e}")


def pass2cache(cache_key, data):
    try:
        cache_dict = {key: str(value) for key, value in data.items()}
        redis_client.hset(cache_key, mapping=cache_dict)
        redis_client.expire(cache_key, TIMEOUT)
        print(f"Successfully saved data in cache by cache key: {cache_key}")
    except Exception as e:
        raise Exception(f"Error in pass2cache: {e}")


async def set_response(image: ImageRaw, get_projections: bool) -> dict:
    try:
        if image is None:
            raise Exception("Image is None")
        image_tiff = image.SaveAsTiff()
        images_show = await tiff2base64(image=image_tiff, is_compress=True)
        response_content = {'image_show': images_show}
        if get_projections:
            response_content['projections'] = generate_projections(image)
        return response_content
    except Exception as e:
        raise Exception(f"Error in save_result: {e}")


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
            pass2cache(image_type, cache_data)
        else:
            await save_cloud(save_path=f'{image_type}', img_array=image_intensities, voxel=voxel)
            cache_data = {'is_cache_size': False}
        pass2cache(image_type, cache_data)
    except Exception as e:
        raise Exception(f"Error in save_result: {e}")


async def save_cloud(save_path: str, img_array: np.ndarray, voxel: list):
    try:
        np.save('/tmp/img_array.npy', img_array)
        np.save('/tmp/voxel.npy', np.array(voxel))

        async with aioboto3.Session().client(
                "s3", endpoint_url=settings.yandex_endpoint,
                aws_access_key_id=settings.yandex_access_key,
                aws_secret_access_key=settings.yandex_secret_key
        ) as s3_client:
            try:
                await s3_client.head_bucket(Bucket=settings.yandex_bucket_name)
                print(f"Successfully connected to bucket: {settings.yandex_bucket_name}")
            except ClientError as e:
                if e.response['Error']['Code'] == '403':
                    raise Exception("Access Denied. Please check your AWS credentials and permissions.")
                elif e.response['Error']['Code'] == '404':
                    raise Exception("Bucket does not exist. Please check the bucket name and try again.")
                else:
                    raise Exception(f"Unexpected error while checking connection: {e}")

            await s3_client.upload_file('/tmp/img_array.npy', settings.yandex_bucket_name, f'{save_path}/img_array.npy')
            await s3_client.upload_file('/tmp/voxel.npy', settings.yandex_bucket_name, f'{save_path}/voxel.npy')

    except s3_client.exceptions.NoSuchBucket:
        raise Exception("No such bucket. Please check the bucket name and try again.")
    except s3_client.exceptions.NoSuchKey:
        raise Exception("No such key. Please check the object key and try again.")
    except s3_client.exceptions.BucketAlreadyExists:
        raise Exception("Bucket already exists. Please use a different bucket name.")
    except s3_client.exceptions.BucketAlreadyOwnedByYou:
        raise Exception("Bucket already owned by you. You can use this bucket.")
    except s3_client.exceptions.InvalidObjectState:
        raise Exception("Invalid object state. Please check the object state and try again.")
    except s3_client.exceptions.NoSuchUpload:
        raise Exception("No such upload. Please check the upload and try again.")
    except s3_client.exceptions.ObjectAlreadyInActiveTierError:
        raise Exception("Object already in active tier.")
    except s3_client.exceptions.ObjectNotInActiveTierError:
        raise Exception("Object not in active tier.")
    except Exception as e:
        raise Exception(f"Error in save_cloud: {e}")
    finally:
        if os.path.exists('/tmp/img_array.npy'):
            os.remove('/tmp/img_array.npy')
        if os.path.exists('/tmp/voxel.npy'):
            os.remove('/tmp/voxel.npy')


async def read_cloud(save_path: str) -> Tuple[np.ndarray, list]:
    try:
        async with aioboto3.Session().client(
                "s3", endpoint_url=settings.yandex_endpoint,
                aws_access_key_id=settings.yandex_access_key,
                aws_secret_access_key=settings.yandex_secret_key
        ) as s3_client:
            img_array_path = f'{save_path}/img_array.npy'
            voxel_path = f'{save_path}/voxel.npy'
            await s3_client.download_file(settings.yandex_bucket_name, img_array_path, '/tmp/img_array.npy')
            await s3_client.download_file(settings.yandex_bucket_name, voxel_path, '/tmp/voxel.npy')
            img_array = np.load('/tmp/img_array.npy')
            voxel = np.load('/tmp/voxel.npy').tolist()
            await s3_client.delete_object(Bucket=settings.yandex_bucket_name, Key=img_array_path)
            await s3_client.delete_object(Bucket=settings.yandex_bucket_name, Key=voxel_path)

            return img_array, voxel
    except Exception as e:
        raise Exception(f"Error in read_cloud: {e}")
    finally:
        if os.path.exists('/tmp/img_array.npy'):
            os.remove('/tmp/img_array.npy')
        if os.path.exists('/tmp/voxel.npy'):
            os.remove('/tmp/voxel.npy')


async def get_cache_data(data_type: str):
    try:
        cache_data = redis_client.hgetall(f"{data_type}")
        if cache_data:
            return cache_data
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


async def handle_image(image_type: str, get_projections: bool = False):
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
            image = ImageRaw(intensitiesIn=img_array, voxelSizeIn=voxel)
            response_content = await set_response(image, get_projections)
            return response_content
        else:
            return 'Error in read cloud/cache'
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


async def rl_deconvolution(model: Union[DeconPsfModel, DeconImageModel], iterations: int,
                           regularization: float, decon_method: str) -> ImageRaw:
    try:
        model.iterationNumber = int(iterations)
        model.regularizationParameter = float(regularization)
        if isinstance(model, DeconPsfModel):
            model.CalculatePSF(deconMethodIn=decon_method)
            res = model.resultImage
        else:
            model.DeconvolveImage(deconMethodIn=decon_method)
            res = model.deconResult.mainImageRaw
        return res
    except Exception as e:
        raise Exception(f"Error in rl_deconvolution: {e}")


async def get_source_img():
    try:
        noisy_cache = await get_cache_data('source_img')
        denoised_cache = await get_cache_data('denoised_img')
        if noisy_cache is None and denoised_cache is None:
            raise Exception("The source image not found in the cache. Maybe the time is up. Upload it again.")
        elif denoised_cache is not None:
            return denoised_cache
        elif noisy_cache is not None:
            return noisy_cache
    except Exception as e:
        raise Exception(f"Error in get_source_img: {e}")
