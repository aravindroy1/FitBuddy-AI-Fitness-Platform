import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import time

from fastapi.staticfiles import StaticFiles
from app.config import MONGO_URI, PORT
from app.yolo_model import ExerciseProcessor
from app.servicebus_listener import ServiceBusListener

app = FastAPI(title="BodyGPT YOLO Exercise Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the static directory exists before mounting
os.makedirs("static", exist_ok=True)

# Mount the static directory to serve processed videos
app.mount("/processed", StaticFiles(directory="static"), name="static")

processor = ExerciseProcessor()
sb_listener = ServiceBusListener()

# Database Setup
db_client = MongoClient(MONGO_URI)
db = db_client.get_database()
analysis_collection = db["exercise_analysis"]

@app.on_event("startup")
def startup_event():
    sb_listener.start()

@app.on_event("shutdown")
def shutdown_event():
    sb_listener.stop()

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "yolo-exercise-service"}

@app.get("/exercise/history/{user_id}")
def get_user_exercise_history(user_id: str):
    cursor = analysis_collection.find({"userId": user_id}).sort("timestamp", -1)
    history = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
    return history

@app.post("/analyze-video")
async def analyze_video(
    background_tasks: BackgroundTasks,
    userId: str = Form(...),
    exercise: str = Form("squat"),
    file: UploadFile = File(...)
):
    # Save temporary file locally
    temp_dir = "temp_videos"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process video synchronously or in a background task
    # For user immediacy, process here, and log result in DB
    result = processor.process_video(file_path, exercise)
    result["userId"] = userId
    result["videoUrl"] = file.filename
    result["timestamp"] = time.time()

    # Save to Database
    inserted = analysis_collection.insert_one(result)
    result["_id"] = str(inserted.inserted_id)

    # Clean up temp file in background
    background_tasks.add_task(os.remove, file_path)

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
