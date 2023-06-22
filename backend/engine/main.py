from api.models import CNNParams, DeconvParams, PSFParams
from engine.cnn_deconvolution_gui import BlurGaussian, MaximizeIntensities

def process_psf(psf_param: PSFParams):
    image = psf_param.start_image
    processed_image = image
    # Process the image as needed
    # processed_image.save('path/to/processed/image.jpg')

    return processed_image


def process_deconv(deconv_param: DeconvParams):
    image = deconv_param.psf_param.start_image
    processed_image = image
    # Process the image as needed
    # processed_image.save('path/to/processed/image.jpg')

    return processed_image


def process_cnn(cnn_param: CNNParams):
    image = cnn_param.start_image
    processed_image = image
    processed_data = processed_image.data
    maximize_intensity = cnn_param.maximize_intensity
    gaussian_blur = int(cnn_param.gaussian_blur)  # Convert to int
    if maximize_intensity:
        processed_data.set_img_array(MaximizeIntensities(processed_data.img_array))
    if gaussian_blur > 0:
        processed_data.set_img_array(BlurGaussian(processed_data.img_array, gaussian_blur))
    processed_image.set_data(processed_data)
    return processed_image




