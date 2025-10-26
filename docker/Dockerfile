FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Pillow and NumPy
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY src/cineviewer /app/cineviewer

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=cineviewer.app
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8080

# Run the application with Waitress
CMD ["python", "-m", "waitress", "--host=0.0.0.0", "--port=8080", "--threads=6", "cineviewer.app:app"]