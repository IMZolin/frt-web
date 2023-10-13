#!/bin/bash

# Create and activate a virtual environment
python3 -m venv env
source env/bin/activate

# Upgrade pip and install project dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

python manage.py runserver
