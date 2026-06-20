import os
import logging
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import datetime

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
        Uploads a local file to Azure Blob Storage and returns the blob URL with a SAS token.
        """
        if not self.blob_service_client:
            logger.warning("Blob Storage client is not configured. Skipping upload.")
            return ""

        try:
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Ensure container exists
            if not container_client.exists():
                try:
                    container_client.create_container(public_access="blob")
                except Exception:
                    # Fallback for Azure accounts with public access disabled
                    container_client.create_container()
                logger.info(f"Created container: {container_name}")

            blob_client = self.blob_service_client.get_blob_client(container=container_name, blob=blob_name)
            
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
                
            # Generate a 1-year SAS token for secure viewing
            sas_token = generate_blob_sas(
                account_name=self.blob_service_client.account_name,
                container_name=container_name,
                blob_name=blob_name,
                account_key=self.blob_service_client.credential.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.datetime.utcnow() + datetime.timedelta(days=365)
            )
            
            blob_url_with_sas = f"{blob_client.url}?{sas_token}"
            logger.info(f"Successfully uploaded {blob_name} to container {container_name}.")
            return blob_url_with_sas
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
