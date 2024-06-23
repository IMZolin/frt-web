#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if .venv directory exists, create if not
if [ ! -d .venv ]; then
    echo "Creating .venv directory..."
    python -m venv .venv
fi
cd

touch logs/redis.log
chmod 777 logs/redis.log

# Clone the engine library
cd backend/engine/engine_lib
git clone -b MVC-implementation https://github.com/IMZolin/simple_psf_extractor.git .
