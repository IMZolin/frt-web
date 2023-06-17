from PIL import Image
import base64
from io import BytesIO
from api.models import CNNParameters

def process_cnn(cnn_param: CNNParameters):
    image_data = cnn_param.start_image['data']
    # img = Image.open(BytesIO(image_data))
    processed_image = image_data  
    # processed_image.save('path/to/processed/image.jpg')

    return processed_image