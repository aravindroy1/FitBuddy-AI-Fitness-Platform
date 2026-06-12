import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bodygpt")
AZURE_SERVICEBUS_CONNECTION_STRING = os.getenv("AZURE_SERVICEBUS_CONNECTION_STRING", "")
QUEUE_NAME = "workout-video-queue"
BLOB_CONTAINER = "workout-videos"
PORT = int(os.getenv("PORT", 8001))
