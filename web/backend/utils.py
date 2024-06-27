import base64
import io


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
