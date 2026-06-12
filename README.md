# BodyGPT - Enterprise AI Fitness Platform

BodyGPT is a production-grade, containerized fitness application utilizing a microservices architecture. It supports AI-powered workouts, diets, RAG chatbots, OpenCV joint angle exercise tracking, food recognition, and laboratory reports parsing.

---

## Service Architecture & Port Mappings

All endpoints consolidate under an Azure Front Door and Application Gateway Ingress Controller (AGIC) in production, but route to individual ports in local testing:

| Service | Port | Technology | Primary Responsibility |
| --- | --- | --- | --- |
| **Frontend** | `8080` / `8` | React, TS, Tailwind CSS | UI Client Interface |
| **Auth Service** | `5001` | Node, Express, TS, BCrypt, JWT | Register, login, OTP dispatches |
| **User Service** | `5002` | Node, Express, TS | Profiles and Goals management |
| **Diet Service** | `5003` | Node, Express, TS, AI Foundry | Calorie budgets, macro splits, meal swaps |
| **Workout Service** | `5004` | Node, Express, TS, AI Foundry | Personalized Home/Gym exercises builder |
| **Chatbot Service** | `5005` | Node, Express, TS, AI Search | AI coach chat loops & vector searches |
| **Progress Service** | `5006` | Node, Express, TS | Weight trackers, BMIs, prediction milestones |
| **YOLO Exercise** | `8001` | Python, FastAPI, YOLOv8-pose | OpenCV squat counter, form check |
| **Food Recognition** | `8002` | Python, FastAPI, YOLOv8 | Nutrient estimator via photo bounds |

---

## Local Orchestration (Docker Compose)

Launch the entire stack (including local MongoDB) using Docker Compose:

```bash
# Build and run all containers
docker-compose up --build
```

Access the UI at [http://localhost:8080](http://localhost:8080).

---

## Deployment to Azure Kubernetes Service (AKS)

1. **Push Images to Azure Container Registry (ACR):**
   ```bash
   az acr login --name bodygptacr
   docker tag bodygpt-auth-service bodygptacr.azurecr.io/auth-service:latest
   docker push bodygptacr.azurecr.io/auth-service:latest
   # (Repeat for other services)
   ```

2. **Apply Kubernetes Manifests:**
   ```bash
   # Apply global secrets & configs
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/configmap.yaml

   # Apply services deployment & HPAs
   kubectl apply -f k8s/auth-service.yaml
   kubectl apply -f k8s/user-service.yaml
   kubectl apply -f k8s/diet-service.yaml
   kubectl apply -f k8s/workout-service.yaml
   kubectl apply -f k8s/chatbot-service.yaml
   kubectl apply -f k8s/progress-service.yaml
   kubectl apply -f k8s/yolo-exercise-service.yaml
   kubectl apply -f k8s/food-recognition-service.yaml
   kubectl apply -f k8s/frontend.yaml

   # Apply path-based routing rules (AGIC Ingress)
   kubectl apply -f k8s/ingress.yaml
   ```
