#!/bin/bash

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --no-input

# Start Gunicorn
echo "Starting Gunicorn..."
gunicorn --bind=0.0.0.0 --timeout 600 backstage_project.wsgi
