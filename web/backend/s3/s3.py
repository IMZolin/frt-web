from structlog import get_logger, getLogger
import aioboto3


class S3Client:
    def __init__(self, endpoint, access_key, secret_key, bucket_name):
        self.__session = aioboto3.Session()
        self.__endpoint = endpoint
        self.__access_key = access_key
        self.__secret_key = secret_key
        self.__bucket_name = bucket_name
        self.log: getLogger = get_logger()

    async def upload_file(self, file, s3_key):
        async with self.__session.client("s3", endpoint_url=self.__endpoint,
                                         aws_access_key_id=self.__access_key,
                                         aws_secret_access_key=self.__secret_key) as s3:
            try:
                self.log.info(f"Uploading {s3_key} to s3")
                await s3.upload_fileobj(file, self.__bucket_name, s3_key)
                self.log.info(f"Finished Uploading {s3_key} to s3")
            except Exception as e:
                self.log.error(f"Unable to s3 upload to {s3_key}: {e}")