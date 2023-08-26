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


# Install Chocolatey if not already installed
if ! command_exists choco; then
    if [ "$OS" == "Windows" ]; then
        echo "Installing Chocolatey on Windows..."
        # Install Chocolatey using PowerShell
        powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    else
        echo "Chocolatey is only supported on Windows"
        exit 1
    fi
fi

# Install Node.js if not already installed
if ! command_exists node; then
    if [ "$OS" == "Linux" ]; then
        echo "Installing Node.js on Linux..."
        sudo apt update
        sudo apt install nodejs
    fi
    if [ "$OS" == "macOS" ]; then
        echo "Installing Node.js on macOS..."
        brew install node
    fi
    if [ "$OS" == "Windows" ]; then
        echo "Installing Node.js on Windows..."
        choco install nodejs
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
git clone -b develop https://github.com/gerasimenkoab/simple_psf_extractor.git engine_lib
cd engine_lib
git pull origin develop
cd ../../..

# Install frontend dependencies
cd frontend
npm install --force
cd ..
