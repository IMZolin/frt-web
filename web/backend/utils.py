import base64
import io
import json
from typing import Union

import numpy as np
import redis
from PIL import Image

from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel
from web.backend.engine.src.extractor.extractor_model import ExtractorModel

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
        res_1, res_2 = None, None
        if convert_type in ['compress', 'original', 'both']:
            if convert_type == 'compress':
                res_1 = await tiff2list(image, compress_quality)
            elif convert_type == 'original':
                res_2 = await tiff2bytes(image)
            else:
                res_1 = await tiff2list(image, compress_quality)
                res_2 = await tiff2bytes(image)
            return res_1, res_2
        else:
            raise ValueError(f"Incorrect conversion type: {convert_type}. Must be one of the "
                             f"['compress_list', 'original', 'both']")
    except Exception as e:
        raise Exception(f"Error in generate_projections: {e}")


def generate_projections(image_raw):
    try:
        img_buf = io.BytesIO()
        projections = AuxCanvasPlot.FigurePILImagekFrom3DArray(image_raw.GetIntensities())
        if projections is None:
            return None
        projections.save(img_buf, format='PNG')
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
    except Exception as e:
        raise Exception(f"Error in pass2cache: {e}")


async def save_result(image: ImageRaw, image_type: str, convert_type: str, is_projections: bool):
    try:
        if image is None:
            raise Exception("Image is None")
        image_tiff = image.SaveAsTiff()
        images_show, images_save = await tiff2base64(image=image_tiff, convert_type=convert_type)
        response_content = {'image_show': images_show, 'image_intensities': image.GetIntensities().tolist(),
                            'voxel': image.GetVoxel()}
        if images_save:
            response_content['image_save'] = images_save
        if is_projections:
            response_content['projections'] = generate_projections(image)
        pass2cache(image_type, response_content)
        return response_content
    except Exception as e:
        raise Exception(f"Error in save_result: {e}")


async def get_data(data_type: str):
    try:
        cache_data = redis_client.hgetall(f"{data_type}")
        if cache_data:
            return cache_data
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


async def init_bead_extractor():
    try:
        beads_cache = await get_data('beads_image')
        if beads_cache is not None:
            bead_extractor = ExtractorModel()
            print(json.loads(beads_cache["voxel"]))
            bead_extractor.SetMainImage(array=np.array(json.loads(beads_cache["image_intensities"])),
                                        voxel=json.loads(beads_cache["voxel"]))
            if bead_extractor is None:
                raise Exception("Bead extractor initialization failed")
            bead_extractor = await get_data('bead_extractor')
            bead_coords = bead_extractor['bead_coords']
            if bead_coords is not None and len(bead_coords) > 0:
                bead_extractor.beadCoords = eval(bead_coords)
            else:
                bead_extractor.beadCoords = []
            return bead_extractor
        else:
            return None
    except Exception as e:
        raise Exception(f"Error in initialization of BeadExtractor: {e}")


async def rl_deconvolution(model: Union[DeconPsfModel, DeconImageModel], iterations: int,
                           regularization: float, decon_method: str) -> ImageRaw:
    model.iterationNumber = int(iterations)
    model.regularizationParameter = float(regularization)
    if isinstance(model, DeconPsfModel):
        model.CalculatePSF(deconMethodIn=decon_method, progBarIn=None)
        return model.resultImage
    else:
        model.DeconvolveImage(deconMethodIn=decon_method, progBarIn=None)
        return model.deconResult.mainImageRaw


async def get_source_img():
    noisy_cache = await get_data('source_img')
    denoised_cache = await get_data('denoised_img')
    if noisy_cache is None and denoised_cache is None:
        raise Exception("The source image not found in the cache. Maybe the time is up. Upload it again.")
    elif denoised_cache is not None:
        return denoised_cache
    elif noisy_cache is not None:
        return noisy_cache
