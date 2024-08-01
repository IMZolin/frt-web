FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN python -m pip install --upgrade pip
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --default-timeout=1000 --retries=5 -r requirements.txt
COPY . .
WORKDIR /app/web/backend/engine
RUN pip install --no-cache-dir --default-timeout=1000 --retries=5 -r requirements.txt
WORKDIR /app/web/frontend
RUN npm install --force
WORKDIR /app
