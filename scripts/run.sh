#!/bin/bash

# Cine Viewer Web App Startup Script

cd "$(dirname "$0")"

echo "Cine Viewer - Web Edition"
echo "=========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Run the app
echo ""
echo "Starting Cine Viewer Web App..."
echo "Access it at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
