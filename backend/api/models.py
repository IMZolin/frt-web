from django.db import models

class Image:
    def __init__(self, file_name):
        self.file_name = file_name
        self.name = ""
        self.data = None
    
    def set_image(self, file_name, img_array):
        self.file_name = file_name
        self.img_array = img_array
    
    def get_file_name(self):
        return self.file_name
    
    def get_image(self):
        return self.img_array
    

class PSFParameters:
    def __init__(self):
        self.bead_size = 0
        self.resolution_xy = 0
        self.resolution_z = 0
        self.iter_num = 0
        self.result = None


class DeconvolutionParameters:
    def __init__(self):
        self.psf_param = None
        self.iter_num = 0
        self.result = None


class CNNParameters:
    def __init__(self):
        self.maximize_intensity = False
        self.gaussian_blur = False
        self.deconv_param = None
        self.result = None


class Task:
    def __init__(self, start_image = None, psf_param = None, deconv_param = None, network_param = None):
        self.start_image = start_image
        self.psf_param = psf_param
        self.deconv_param = deconv_param
        self.network_param = network_param


