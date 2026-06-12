import json
import threading
import time
import logging
from pymongo import MongoClient
from app.config import MONGO_URI, AZURE_SERVICEBUS_CONNECTION_STRING, QUEUE_NAME
from app.yolo_model import FoodProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("servicebus_listener")

try:
    from azure.servicebus import ServiceBusClient
    HAS_SERVICEBUS = True
except ImportError:
    HAS_SERVICEBUS = False
    logger.warning("Azure ServiceBus SDK not available. Running background loop simulator.")

class ServiceBusListener:
    def __init__(self):
        self.db_client = MongoClient(MONGO_URI)
        self.db = self.db_client.get_database()
        self.collection = self.db["food_analysis"]
        self.processor = FoodProcessor()
        self.running = False

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        logger.info("Service Bus Listener thread started in Food Recognition Service.")

    def stop(self):
        self.running = False

    def _run_loop(self):
        if not HAS_SERVICEBUS or not AZURE_SERVICEBUS_CONNECTION_STRING:
            logger.info("Service Bus client starting in Simulated Mode for Food Service.")
            while self.running:
                time.sleep(10)
            return

        try:
            sb_client = ServiceBusClient.from_connection_string(AZURE_SERVICEBUS_CONNECTION_STRING)
            receiver = sb_client.get_queue_receiver(queue_name=QUEUE_NAME)
            logger.info(f"Subscribed to Service Bus Queue: {QUEUE_NAME}")
            
            with receiver:
                while self.running:
                    messages = receiver.receive_messages(max_message_count=1, max_wait_time=5)
                    for msg in messages:
                        try:
                            body = json.loads(str(msg))
                            user_id = body.get("userId")
                            image_url = body.get("imageUrl")

                            logger.info(f"Received food image analysis request: User={user_id}, Image={image_url}")

                            # Process image
                            analysis_result = self.processor.process_image(image_url)
                            analysis_result["userId"] = user_id
                            analysis_result["imageUrl"] = image_url
                            analysis_result["timestamp"] = time.time()

                            # Save to Cosmos DB MongoDB API
                            self.collection.insert_one(analysis_result)
                            logger.info(f"Food Analysis saved to database for user {user_id}")

                            receiver.complete_message(msg)
                        except Exception as e:
                            logger.error(f"Failed to process Food Service Bus message: {e}")
                            receiver.abandon_message(msg)
        except Exception as e:
            logger.error(f"Service Bus Connection lost: {e}. Reconnecting in 30s...")
            time.sleep(30)
            if self.running:
                self._run_loop()
