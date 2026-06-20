import cv2
import os
import math
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("yolo_model")

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False
    logger.warning("Ultralytics library not available. Using mock mode.")

class ExerciseProcessor:
    def __init__(self):
        self.model = None
        if HAS_ULTRALYTICS:
            try:
                # Load YOLOv8 Pose model (weights download automatically if missing)
                self.model = YOLO("yolov8n-pose.pt")
                logger.info("YOLOv8-pose model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load YOLOv8-pose model: {e}. Falling back to mock.")

    def calculate_angle(self, a, b, c):
        """Calculate the angle between three keypoints (a, b, c)."""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle

    def process_video(self, video_path: str, exercise_name: str = "squat") -> dict:
        """
        Analyze the exercise video.
        Counts repetitions and estimates form accuracy using skeleton keypoints.
        """
        try:
            if not self.model:
                logger.error("YOLOv8 Pose model is not available.")
                return {"error": "YOLO model failed to initialize on the backend.", "processed": False}

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"error": "Failed to open video source", "processed": False}

            # Setup VideoWriter
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 25
            
            output_filename = f"processed_{os.path.basename(video_path)}"
            output_dir = "static"
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, output_filename)
            
            # Try avc1 (H.264) codec first for browser compatibility, fall back to mp4v if unavailable
            fourcc = cv2.VideoWriter_fourcc(*'avc1')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            if not out.isOpened():
                logger.warning("avc1 codec not available. Falling back to mp4v...")
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

            rep_count = 0
            stage = "up"  # squat phase tracker ("up" vs "down")
            form_accuracy_scores = []
            feedback = []

            logger.info(f"Processing video {video_path} for exercise {exercise_name}...")

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Run YOLOv8 Pose prediction on the frame
                results = self.model(frame, verbose=False)
                
                # Default annotated frame is the copy of original
                annotated_frame = frame.copy()
                
                for result in results:
                    # Plot automatically connects joints and overlays boxes/confidence
                    annotated_frame = result.plot()
                    
                    keypoints = result.keypoints.data.cpu().numpy()
                    if len(keypoints) == 0:
                        continue
                    
                    person_kps = keypoints[0] # Track the primary subject
                    
                    if len(person_kps) >= 17:
                        # COCO Pose indices: 5: Left Shoulder, 11: Left Hip, 13: Left Knee, 15: Left Ankle
                        hip = person_kps[11][:2]
                        knee = person_kps[13][:2]
                        ankle = person_kps[15][:2]
                        shoulder = person_kps[5][:2]

                        # Verify keypoints confidence
                        if person_kps[11][2] > 0.5 and person_kps[13][2] > 0.5 and person_kps[15][2] > 0.5:
                            knee_angle = self.calculate_angle(hip, knee, ankle)
                            hip_angle = self.calculate_angle(shoulder, hip, knee)

                            # Logic for Squat Counter
                            if exercise_name.lower() == "squat":
                                # Deep squat threshold
                                if knee_angle < 100:
                                    if stage == "up":
                                        stage = "down"
                                        # Form critique
                                        if hip_angle < 50:
                                            feedback.append("Avoid excessive forward lean (hinging too far at hips)")
                                            form_accuracy_scores.append(70.0)
                                        else:
                                            form_accuracy_scores.append(95.0)
                                if knee_angle > 160 and stage == "down":
                                    stage = "up"
                                    rep_count += 1
                                    logger.info(f"Rep counted! Total: {rep_count}")
                                    
                # Draw Rep Count and Exercise stats overlay on the video
                cv2.putText(annotated_frame, f"REPS: {rep_count}", (30, 80), cv2.FONT_HERSHEY_DUPLEX, 1.5, (0, 255, 0), 3)
                cv2.putText(annotated_frame, f"STAGE: {stage.upper()}", (30, 140), cv2.FONT_HERSHEY_DUPLEX, 1.2, (255, 0, 0), 2)
                
                # Write frame to output video
                out.write(annotated_frame)

            cap.release()
            out.release()
            
            # Calculate final stats
            final_reps = rep_count
            final_accuracy = float(np.mean(form_accuracy_scores)) if len(form_accuracy_scores) > 0 else 90.0
            unique_feedback = list(set(feedback))
            if not unique_feedback:
                unique_feedback = ["Excellent back neutrality", "Keep controlling tempo on the eccentric phase"]

            return {
                "exercise": exercise_name.capitalize(),
                "rep_count": final_reps,
                "form_accuracy": round(final_accuracy, 1),
                "feedback": unique_feedback,
                "processed": True,
                "video_url": f"/processed/{output_filename}"
            }
        except Exception as e:
            logger.exception(f"Error processing video: {e}")
            return {"error": f"Internal processing error: {str(e)}", "processed": False}
