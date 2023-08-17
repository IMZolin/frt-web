from django.core.cache import cache as django_cache
from PIL import Image
import json
import io
import base64

def save_as_tiff(image_raw, is_one_page, filename="img", outtype="uint8"):
    try:
        tagID = 270
        strVoxel = json.dumps(image_raw.voxel)
        imlist = []
        for tmp in image_raw.imArray:
            imlist.append(Image.fromarray(tmp.astype(outtype)))
        imlist[0].save(
            filename, tiffinfo={tagID:strVoxel}, save_all=True, append_images=imlist[1:]
        )
        print(imlist[0])
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
    else:
        pil_image[0].save(byte_stream, format='TIFF', save_all=True, append_images=pil_image[1:])
        
    byte_stream.seek(0)
    base64_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')
    return base64_string

def pass2cache(cache_key, key, data):
    cache_dict = dict(zip(key, data))
    django_cache.set(cache_key, cache_dict, timeout=None)