FROM python:3.10-slim

WORKDIR /app

# Install build and runtime dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
# Pre-install CPU-only PyTorch to avoid massive CUDA images and disk space issues
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directory for YOLOv8 downloads
RUN mkdir -p /root/.config/Ultralytics

COPY app ./app

ENV PORT=8001
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
