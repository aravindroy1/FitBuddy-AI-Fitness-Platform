FROM python:3.10-slim

WORKDIR /app

# Install build and runtime dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directory for YOLOv8 downloads
RUN mkdir -p /root/.config/Ultralytics

COPY app ./app

ENV PORT=8002
EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
