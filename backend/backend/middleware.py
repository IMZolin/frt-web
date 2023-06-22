import logging

logger = logging.getLogger('django.request')

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        logger.info(f'Request: {request.method} {request.path}')
        response = self.get_response(request)
        logger.info(f'Response: {response.status_code}')
        return response

class IgnoreTensorFlowFilter(logging.Filter):
    def filter(self, record):
        message = record.getMessage()
        return 'Could not find cuda drivers on your machine' not in message and \
               'This TensorFlow binary is optimized' not in message

class IgnoreFontManagerFilter(logging.Filter):
    def filter(self, record):
        return 'font_manager generated new fontManager' not in record.getMessage()