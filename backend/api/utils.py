from django.core.cache import cache as django_cache
from PIL import Image
import json
import io
import base64
from engine.engine_lib.src.model.image_projections_model import ImageProjectionsModel
from engine.engine_lib.src.model.ImageRaw_class import ImageRaw

# Cache timeout in seconds (e.g., 30 minutes)
CACHE_TIMEOUT = 1800


def save_as_tiff(image_raw, is_one_page, filename="img", outtype="uint8"):
    try:
        tagID = 270
        strVoxel = json.dumps(image_raw.voxel)
        imlist = [Image.fromarray(tmp.astype(outtype)) for tmp in image_raw.imArray]
        imlist[0].save(
            filename, tiffinfo={tagID: strVoxel}, save_all=True, append_images=imlist[1:]
        )
        if is_one_page:
            return imlist[0]
        else:
            return imlist
    except Exception as e:
        raise IOError(f"Cannot save file {filename}: {e}")


def pil_image_to_byte_stream(pil_image, is_one_page):
    byte_stream = io.BytesIO()
    base64_list = []

    try:
        if is_one_page:
            pil_image.save(byte_stream, format='TIFF')
            base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
            return base64_string, None
        else:
            for page in pil_image:
                byte_stream = io.BytesIO()  # Reset byte stream for each page
                page.save(byte_stream, format='TIFF')
                base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
                base64_list.append(base64_string)

            byte_stream2 = io.BytesIO()
            pil_image[0].save(byte_stream2, format='TIFF', save_all=True, append_images=pil_image[1:])
            base64_string2 = base64.b64encode(byte_stream2.getvalue()).decode('utf-8')
            return base64_list, base64_string2
    except Exception as e:
        raise IOError(f"Cannot convert PIL image to byte stream: {e}")


def generate_projections(image_raw: ImageRaw, projections_coord=None, projection_type='triple_img'):
    projection_maker = ImageProjectionsModel()
    projection_maker._image = image_raw
    fig, axes = projection_maker.CreateProjections(projections_coord, projection_type)

    ## fix???
    if fig is None:
        return None

    # Generate Byte string
    try:
        img_buf, byte_stream = io.BytesIO(), io.BytesIO()
        fig.savefig(img_buf, format='png')
        img_buf.seek(0)  # Ensure the buffer is read from the start
        tmp_img = Image.open(img_buf)
        tmp_img.save(byte_stream, format='TIFF')
        base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
        return [base64_string]
    except Exception as e:
        raise IOError(f"Cannot generate projections: {e}")


def pass2cache(cache_key, key, data):
    try:
        cache_dict = dict(zip(key, data))
        django_cache.set(cache_key, cache_dict, timeout=CACHE_TIMEOUT)
    except Exception as e:
        raise IOError(f"Cannot pass data to cache: {e}")