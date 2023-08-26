#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine the current operating system
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    OS="Windows"
else
    echo "Unsupported operating system"
    exit 1
fi

# Install Node.js if not already installed
if ! command_exists node; then
    if [ "$OS" == "Linux" ]; then
        echo "Installing Node.js on Linux..."
        # Add your Node.js installation steps for Linux here
    fi
    if [ "$OS" == "macOS" ]; then
        echo "Installing Node.js on macOS..."
        # Add your Node.js installation steps for macOS here
    fi
    if [ "$OS" == "Windows" ]; then
        echo "Installing Node.js on Windows..."
        # Add your Node.js installation steps for Windows here
    fi
fi

# Check if .venv directory exists, create if not
if [ ! -d .venv ]; then
    if [ "$OS" == "Linux" ] || [ "$OS" == "macOS" ]; then
        echo "Creating .venv directory..."
        python3 -m venv .venv
    fi
    if [ "$OS" == "Windows" ]; then
        echo "Creating .venv directory..."
        python -m venv .venv
    fi
fi

# Clone the engine library
cd backend/engine
git clone https://github.com/gerasimenkoab/simple_psf_extractor.git engine_lib
cd ../..

# Install frontend dependencies
cd frontend
npm install --force
cd ..

# Activate .venv environment
if [ "$OS" == "Linux" ] || [ "$OS" == "macOS" ]; then
    source .venv/bin/activate
elif [ "$OS" == "Windows" ]; then
    # Use appropriate activation command for Windows
    # For example, with Git Bash:
    source .venv/Scripts/activate
fi