import base64
import io
import json
from typing import Union

import numpy as np
import redis

from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
TIMEOUT = 600


async def tiff2list(image, compress_quality=50):
    try:
        base64_list = []
        for layer in image:
            byte_stream = io.BytesIO()
            layer.save(byte_stream, format='TIFF', quality=compress_quality)
            byte_stream.seek(0)
            base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
            base64_list.append(base64_string)
        return base64_list
    except Exception as e:
        raise Exception(f"Error in tiff2byte_list: {e}")


async def tiff2bytes(image):
    try:
        byte_stream2 = io.BytesIO()
        image[0].save(byte_stream2, format='TIFF', save_all=True, append_images=image[1:])
        byte_stream2.seek(0)
        base64_string2 = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
        return base64_string2
    except Exception as e:
        raise Exception(f"Error in tiff2bytes: {e}")


async def tiff2base64(image, compress_quality=50, convert_type: str = 'compress'):
    try:
        if convert_type in ['compress', 'original']:
            if convert_type == 'compress':
                return await tiff2list(image, compress_quality)
            elif convert_type == 'original':
                return await tiff2bytes(image)
        else:
            raise ValueError(f"Incorrect conversion type: {convert_type}. Must be one of the "
                             f"['compress_list', 'original', 'both']")
    except Exception as e:
        raise Exception(f"Error in generate_projections: {e}")


async def save_result(image: ImageRaw, image_type: str, is_projections: bool):
    try:
        if image is None:
            raise Exception("Image is None")
        image_tiff = image.SaveAsTiff()
        images_show = await tiff2base64(image=image_tiff, convert_type='compress')
        response_content = {'image_show': images_show}
        if is_projections:
            response_content['projections'] = generate_projections(image)
        cache_data = {
            'image_intensities': image.GetIntensities().tolist(),
            'voxel': image.GetVoxel()
        }
        pass2cache(image_type, cache_data)
        return response_content
    except Exception as e:
        raise Exception(f"Error in save_result: {e}")


def generate_projections(image_raw):
    img_buf = io.BytesIO()
    projections = AuxCanvasPlot.FigurePILImagekFrom3DArray(image_raw.GetIntensities())
    if projections is None:
        return None
    projections.save(img_buf, format='TIFF')
    img_buf.seek(0)
    base64_string = base64.b64encode(img_buf.getvalue()).decode('utf-8')
    return [base64_string]


def pass2cache(cache_key, data):
    cache_dict = {key: str(value) for key, value in data.items()}
    redis_client.hset(cache_key, mapping=cache_dict)
    redis_client.expire(cache_key, TIMEOUT)


async def get_data(data_type: str):
    try:
        cache_data = redis_client.hgetall(f"{data_type}")
        if cache_data:
            return cache_data
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


async def get_image(data_type: str, is_projections: bool = False):
    try:
        cache_data = redis_client.hgetall(f"{data_type}")
        if cache_data:
            image = ImageRaw(intensitiesIn=np.array(json.loads(cache_data["image_intensities"])),
                             voxelSizeIn=json.loads(cache_data["voxel"]))
            image_tiff = image.SaveAsTiff()
            images_show = await tiff2base64(image=image_tiff, convert_type='compress')
            response_content = {'image_show': images_show}
            if is_projections:
                response_content['projections'] = generate_projections(image)
            return response_content
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


async def rl_deconvolution(model: Union[DeconPsfModel, DeconImageModel], iterations: int,
                           regularization: float, decon_method: str) -> ImageRaw:
    model.iterationNumber = int(iterations)
    model.regularizationParameter = float(regularization)
    if isinstance(model, DeconPsfModel):
        model.CalculatePSF(deconMethodIn=decon_method)
        res = model.resultImage
    else:
        model.DeconvolveImage(deconMethodIn=decon_method)
        res = model.deconResult.mainImageRaw
    return res


async def get_source_img():
    noisy_cache = await get_data('source_img')
    denoised_cache = await get_data('denoised_img')
    if noisy_cache is None and denoised_cache is None:
        raise Exception("The source image not found in the cache. Maybe the time is up. Upload it again.")
    elif denoised_cache is not None:
        return denoised_cache
    elif noisy_cache is not None:
        return noisy_cache
