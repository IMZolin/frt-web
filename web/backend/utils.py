import base64
import io
import redis

from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
TIMEOUT = 600


def tiff2base64(image, compress_quality=50, is_save=False):
    base64_list = []
    for layer in image:
        byte_stream = io.BytesIO()
        layer.save(byte_stream, format='TIFF', quality=compress_quality)
        byte_stream.seek(0)
        base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
        base64_list.append(base64_string)
    if is_save:
        byte_stream2 = io.BytesIO()
        image[0].save(byte_stream2, format='TIFF', save_all=True, append_images=image[1:])
        byte_stream2.seek(0)
        base64_string2 = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
        return base64_list, base64_string2
    else:
        return base64_list, None


def generate_projections(image_raw):
    img_buf = io.BytesIO()
    projections = AuxCanvasPlot.FigurePILImagekFrom3DArray(image_raw.GetIntensities())
    if projections is None:
        return None
    projections.save(img_buf, format='PNG')
    img_buf.seek(0)
    base64_string = base64.b64encode(img_buf.getvalue()).decode('utf-8')
    return [base64_string]


def pass2cache(cache_key, data):
    cache_dict = {key: str(value) for key, value in data.items()}
    redis_client.hset(cache_key, mapping=cache_dict)
    redis_client.expire(cache_key, TIMEOUT)
