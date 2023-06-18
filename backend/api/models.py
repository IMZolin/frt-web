from django.db import models
import base64
from io import BytesIO

class ImageParameters:
    def __init__(self, file_name = None, data = None):
        self.file_name = file_name
        self.data = data
        self.data_view = self._image_to_base64(self.data)
    
    def to_json(self):
        return {
            'file_name': self.file_name,
            'data': self.data_view,
        }
    
    @staticmethod
    def _image_to_base64(image):
        image_io = BytesIO()
        image.save(image_io, format='TIFF')
        image_base64 = base64.b64encode(image_io.getvalue()).decode('utf-8')
        return image_base64
    
    
class PSFParameters:
    def __init__(self, start_image=None, bead_size = 0, resolution_xy = 0, resolution_z = 0, iter_num = 0, result = None):
        self.start_image=start_image
        self.bead_size = bead_size
        self.resolution_xy = resolution_xy
        self.resolution_z = resolution_z
        self.iter_num = iter_num
        self.result = result
    
    def set_result(self, result):
        self.result = result
    
    def to_json(self):
        return {
            "start_image": self.start_image.to_json() if self.start_image else None,
            "bead_size": self.bead_size,
            "resolution_xy": self.resolution_xy,
            "resolution_z": self.resolution_z,
            "iter_num": self.iter_num,
            "result": self.result.to_json() if self.result else None
        }


class DeconvolutionParameters:
    def __init__(self, psf_param = None, iter_num = 0, result = None):
        self.psf_param = psf_param
        self.iter_num = iter_num
        self.result = result
    
    def set_result(self, result):
        self.result = result
    
    def to_json(self):
        return {
            "psf_param": self.psf_param.to_json() if self.psf_param else None,
            "iter_num": self.iter_num,
            "result": self.result.to_json() if self.psf_param else None
        }


class CNNParameters:
    def __init__(self, start_image=None, maximize_intensity=False, gaussian_blur=0):
        self.start_image = start_image
        self.maximize_intensity = maximize_intensity
        self.gaussian_blur = gaussian_blur
        self.result = None

    def set_result(self, result):
        self.result = result

    def to_json(self):
        return {
            "start_image": self.start_image.to_json() if self.result else None,
            "maximize_intensity": self.maximize_intensity,
            "gaussian_blur": self.gaussian_blur,
            "result": self.result.to_json() if self.result else None
        }