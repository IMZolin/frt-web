from api.models import CNNParams, DeconvParams, PSFParams


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
    # Process the image as needed
    # processed_image.save('path/to/processed/image.jpg')

    return processed_image


