FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies for Celery (e.g., Redis)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        redis-server \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the 'logs' directory in the container
RUN mkdir /app/logs
RUN chmod -R 777 /app/logs

# Copy the whole application code
COPY . .

# Expose the port (not necessary unless you are using it with 'docker run -p')
EXPOSE 8000

# Set the command to run Celery worker
CMD ["celery", "-A", "backend", "worker", "--loglevel=info", "--concurrency=4"]
