import os
import logging
from azure.storage.blob import BlobServiceClient

logger = logging.getLogger("blob_service")

class BlobUploader:
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.blob_service_client = None
        if self.connection_string:
            try:
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                logger.info("Azure Blob Storage client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Azure Blob Storage client: {e}")

    def upload_file(self, file_path: str, blob_name: str, container_name: str) -> str:
        """
        Uploads a local file to Azure Blob Storage and returns the blob URL.
        """
        if not self.blob_service_client:
            logger.warning("Blob Storage client is not configured. Skipping upload.")
            return ""

        try:
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Ensure container exists
            if not container_client.exists():
                container_client.create_container(public_access="blob")
                logger.info(f"Created container: {container_name}")

            blob_client = self.blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
                
            logger.info(f"Successfully uploaded {blob_name} to container {container_name}.")
            return blob_client.url
        except Exception as e:
            logger.error(f"Failed to upload file to Blob Storage: {e}")
            return ""

    def delete_blob(self, container_name: str, blob_name: str):
        if not self.blob_service_client:
            return False
        try:
            blob_client = self.blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            blob_client.delete_blob()
            logger.info(f"Successfully deleted {blob_name} from container {container_name}.")
            return True
        except Exception as e:
            logger.error(f"Failed to delete blob {blob_name}: {e}")
            return False
