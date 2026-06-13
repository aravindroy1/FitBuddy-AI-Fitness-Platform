import os
import shutil
import base64
import json
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, WebSocket, WebSocketDisconnect
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

@app.websocket("/exercise/ws-stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    rep_count = 0
    stage = "up"
    feedback = []
    
    try:
        while True:
            # Receive frame data from client
            message = await websocket.receive_text()
            data = json.loads(message)
            
            image_str = data.get("image", "")
            exercise_name = data.get("exercise", "squat")
            
            if image_str.startswith("data:image"):
                header, encoded = image_str.split(",", 1)
                image_data = base64.b64decode(encoded)
                nparr = np.frombuffer(image_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    # Run YOLOv8 Pose prediction
                    results = processor.model(frame, verbose=False)
                    annotated_frame = frame.copy()
                    
                    for result in results:
                        annotated_frame = result.plot()
                        
                        keypoints = result.keypoints.data.cpu().numpy()
                        if len(keypoints) == 0:
                            continue
                        
                        person_kps = keypoints[0]
                        if len(person_kps) >= 17:
                            hip = person_kps[11][:2]
                            knee = person_kps[13][:2]
                            ankle = person_kps[15][:2]
                            shoulder = person_kps[5][:2]
                            
                            if person_kps[11][2] > 0.5 and person_kps[13][2] > 0.5 and person_kps[15][2] > 0.5:
                                knee_angle = processor.calculate_angle(hip, knee, ankle)
                                hip_angle = processor.calculate_angle(shoulder, hip, knee)
                                
                                if exercise_name.lower() == "squat":
                                    if knee_angle < 100:
                                        if stage == "up":
                                            stage = "down"
                                            feedback.append("Good squat depth!")
                                    if knee_angle > 160 and stage == "down":
                                        stage = "up"
                                        rep_count += 1
                                elif exercise_name.lower() == "pushup":
                                    elbow = person_kps[7][:2]
                                    wrist = person_kps[9][:2]
                                    if person_kps[7][2] > 0.5 and person_kps[9][2] > 0.5:
                                        elbow_angle = processor.calculate_angle(shoulder, elbow, wrist)
                                        if elbow_angle < 90:
                                            if stage == "up":
                                                stage = "down"
                                                feedback.append("Good pushup depth!")
                                        if elbow_angle > 160 and stage == "down":
                                            stage = "up"
                                            rep_count += 1
                                else:
                                    if knee_angle < 120:
                                        if stage == "up":
                                            stage = "down"
                                    if knee_angle > 160 and stage == "down":
                                        stage = "up"
                                        rep_count += 1
                    
                    # Draw text overlay on the live frame
                    cv2.putText(annotated_frame, f"REPS: {rep_count}", (20, 50), cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 255, 0), 2)
                    cv2.putText(annotated_frame, f"STAGE: {stage.upper()}", (20, 90), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 0, 0), 2)
                    
                    # Convert back to JPEG base64 to send to client
                    _, buffer = cv2.imencode('.jpg', annotated_frame)
                    processed_encoded = base64.b64encode(buffer).decode('utf-8')
                    
                    await websocket.send_json({
                        "image": f"data:image/jpeg;base64,{processed_encoded}",
                        "rep_count": rep_count,
                        "stage": stage,
                        "feedback": list(set(feedback))[-3:]
                    })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print("WS Error:", e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
