FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Copy models to testing
COPY ./engine/engine_lib/src/cnn/CNN_Deconvolution/models/3d_gaus_blur.h5 .

# Install system dependencies for Celery (e.g., Redis)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        redis-server \
    && rm -rf /var/lib/apt/lists/*

# Create the 'logs' directory in the container and the redis.log file
RUN mkdir -p /app/logs \
    && touch /app/logs/redis.log \
    && chmod -R 777 /app/logs

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the whole application code
COPY . .

# Expose the port (not necessary unless you are using it with 'docker run -p')
EXPOSE 8000

# Set the command to run Gunicorn with the specified options
CMD ["gunicorn", "-c", "gunicorn.conf.py", "backend.wsgi:application"]
