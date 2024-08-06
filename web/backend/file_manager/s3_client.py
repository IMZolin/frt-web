from botocore.exceptions import ClientError
import aioboto3

from config import settings


class S3Client:
    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket_name: str):
        self.__session = aioboto3.Session()
        self.__endpoint = endpoint
        self.__access_key = access_key
        self.__secret_key = secret_key
        self.__bucket_name = bucket_name

    async def upload_file(self, file_path: str, object_name: str):
        async with self.__session.client(
                "s3", endpoint_url=self.__endpoint,
                aws_access_key_id=self.__access_key,
                aws_secret_access_key=self.__secret_key
        ) as s3_c:
            try:
                await s3_c.upload_file(file_path, self.__bucket_name, object_name)
                print(f"Successfully uploaded the file {object_name} to {file_path}")
            except ClientError as e:
                raise Exception(f"Error uploading file to S3: {e}")

    async def download_file(self, object_name: str, file_path: str):
        async with self.__session.client(
                "s3", endpoint_url=self.__endpoint,
                aws_access_key_id=self.__access_key,
                aws_secret_access_key=self.__secret_key
        ) as s3_c:
            try:
                await s3_c.download_file(self.__bucket_name, object_name, file_path)
                print(f"Successfully downloaded the file {object_name} to {file_path}")
            except ClientError as e:
                raise Exception(f"Error downloading file from S3: {e}")

    async def delete_file(self, object_name: str):
        async with self.__session.client(
                "s3", endpoint_url=self.__endpoint,
                aws_access_key_id=self.__access_key,
                aws_secret_access_key=self.__secret_key
        ) as s3_c:
            try:
                await s3_c.delete_object(Bucket=self.__bucket_name, Key=object_name)
                print(f"Successfully deleted the file: {object_name}")
            except ClientError as e:
                raise Exception(f"Error deleting file from S3: {e}")

    async def head_bucket(self):
        async with self.__session.client(
                "s3", endpoint_url=self.__endpoint,
                aws_access_key_id=self.__access_key,
                aws_secret_access_key=self.__secret_key
        ) as s3_c:
            try:
                await s3_c.head_bucket(Bucket=self.__bucket_name)
                print(f"Successfully connected to bucket: {self.__bucket_name}")
            except ClientError as e:
                raise Exception(f"Error connecting to bucket: {e}")

    async def does_folder_exist(self, folder_path):
        try:
            async with self.__session.client(
                    "s3", endpoint_url=self.__endpoint,
                    aws_access_key_id=self.__access_key,
                    aws_secret_access_key=self.__secret_key
            ) as s3_c:
                result = await s3_c.list_objects_v2(Bucket=self.__bucket_name, Prefix=folder_path, Delimiter='/')
            return 'Contents' in result or 'CommonPrefixes' in result
        except Exception as e:
            raise Exception(f"Error checking folder existence: {e}")


s3_client = S3Client(
    endpoint=settings.yandex_endpoint,
    access_key=settings.yandex_access_key,
    secret_key=settings.yandex_secret_key,
    bucket_name=settings.yandex_bucket_name
)
