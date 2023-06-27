import numpy as np
from PIL import Image, ImageFilter


# Method which provides image bluring
def BlurGaussian(array, gaussianBlurRad: int):
    for layer in range(array.shape[0]):
        layerArray = array[layer, :, :]
        image = Image.fromarray(layerArray)
        image = image.filter(ImageFilter.GaussianBlur(radius=gaussianBlurRad))
        image = image.filter(ImageFilter.MedianFilter(size=3))
        array[layer, :, :] = np.array(image, dtype="uint8")[:, :]
    return array


# Method whic provides image intensities maximization
def MaximizeIntesities(array):
    array = (array / np.amax(array) * 255).astype("uint8")
    return array
