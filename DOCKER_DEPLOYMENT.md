# Docker Deployment Guide

## Quick Start

### Development
```bash
# Build and run the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

The application will be available at: **http://localhost:8080**

### Production Deployment

```bash
docker-compose -f Docker_Compose.yaml -f docker-compose.prod.yml up -d --build
```

## Server Deployment

### Option 1: Build on Server
```bash
# Clone your repository on the server
git clone <your-repo-url>
cd CV-Web_App

# Build and run
docker-compose up -d --build
```

### Option 2: Pre-built Images (Recommended)

1. **Build and push to registry:**
```bash
# Build the image
docker build -t your-registry/cinematography-app:latest .

# Push to registry (Docker Hub, AWS ECR, etc.)
docker push your-registry/cinematography-app:latest
```

2. **Update Docker Compose to use pre-built image:**
```yaml
services:
  cv-web-app:
    image: your-registry/cinematography-app:latest
    # Remove the build section
```

3. **Deploy on server:**
```bash
# Pull and run the pre-built image
docker-compose pull
docker-compose up -d
```

## Configuration

### Environment Variables
- `FLASK_ENV`: Set to `production` for production deployment
- `FLASK_DEBUG`: Set to `False` for production

### Ports
- **8080**: Flask application

### Volumes
- `./uploads:/app/uploads`: Persistent storage for uploaded images
- `uploads_data`: Named volume for production deployments

## Monitoring

### Health Check
The application includes a health check endpoint that Docker Compose will monitor.

### Logs
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f cv-web-app
```

## Scaling (Optional)

```bash
# Scale the Flask application
docker-compose up --scale cv-web-app=3 -d
```

Note: You'll need a load balancer if scaling beyond 1 instance.

## Troubleshooting

### Common Issues
1. **Port already in use**: Change the port mapping in Docker Compose
2. **Permission issues**: Ensure uploads directory has proper permissions
3. **Out of memory**: Increase Docker memory limits for image processing

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -a
```