from django.core.cache import cache as django_cache
from PIL import Image
import json
import io
import base64
from engine.engine_lib.src.model.image_projections_model import ImageProjectionsModel
from engine.engine_lib.src.model.ImageRaw_class import ImageRaw

def save_as_tiff(image_raw, is_one_page, filename="img", outtype="uint8"):
    try:
        tagID = 270
        strVoxel = json.dumps(image_raw.voxel)
        imlist = [Image.fromarray(tmp.astype(outtype)) for tmp in image_raw.imArray]
        imlist[0].save(
            filename, tiffinfo={tagID:strVoxel}, save_all=True, append_images=imlist[1:]
        )
        if is_one_page:
            return imlist[0]
        else:
            return imlist
    except:
        raise IOError("Cannot save file "+filename,"file_not_saved")

def pil_image_to_byte_stream(pil_image, is_one_page):
    byte_stream = io.BytesIO()
    if is_one_page:
        pil_image.save(byte_stream, format='TIFF')
        byte_stream.seek(0)
        base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
        return base64_string, None
    else:
        base64_list = []
        for page in pil_image:
            page.save(byte_stream, format='TIFF')
            byte_stream.seek(0)
            base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
            base64_list.append(base64_string)
        byte_stream2 = io.BytesIO()
        pil_image[0].save(byte_stream2, format='TIFF', save_all=True, append_images=pil_image[1:])
        byte_stream2.seek(0)
        base64_string2 = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
        return base64_list, base64_string2

def generate_projections(image_raw : ImageRaw, projections_coord = None, projection_type = 'one_img'):
    projection_maker = ImageProjectionsModel()
    projection_maker._image = image_raw
    fig, axes = projection_maker.CreateProjections(projections_coord, projection_type)
    
    if fig == None:
        return None

    # Generate Byte string
    img_buf, byte_stream = io.BytesIO(), io.BytesIO()
    fig.savefig(img_buf, format='png')
    tmp_img = Image.open(img_buf)
    tmp_img.save(byte_stream, format='TIFF')
    byte_stream.seek(0)
    base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
    return [base64_string]


def pass2cache(cache_key, key, data):
    cache_dict = dict(zip(key, data))
    django_cache.set(cache_key, cache_dict, timeout=None)