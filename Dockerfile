FROM python:3.11-slim
RUN apt-get update && apt-get install -y nodejs && apt-get clean && apt-get install -y npm
RUN python -m pip install --upgrade pip
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
WORKDIR /app/web/backend/engine
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
WORKDIR /app/web/frontend
RUN npm install --force
WORKDIR /app
