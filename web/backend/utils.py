import base64
import io
import redis

from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot

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
