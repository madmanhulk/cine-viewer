# Docker Deployment Guide

## Prerequisites

1. Docker and Docker Compose installed
2. GitHub account with Container Registry access
3. GitHub Personal Access Token (PAT) with `read:packages` scope

## Configuration

### Environment Variables (.env)
Create a `.env` file with the following variables:
```env
# Application Settings
PORT=8080
DOMAIN=your-domain.com

# GitHub Container Registry Settings
GITHUB_USERNAME=your-github-username
TAG=latest

# Environment
FLASK_ENV=production
FLASK_DEBUG=False
```

## Deployment Options

### Development Deployment
```bash
# Pull and run the application
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at: **http://localhost:8080**

### Production Deployment
```bash
# Deploy with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## GitHub Container Registry Setup

1. **Login to GitHub Container Registry:**
```bash
# PowerShell
$CR_PAT = "YOUR-PAT-TOKEN"
echo $CR_PAT | docker login ghcr.io -u YOUR-GITHUB-USERNAME --password-stdin
```

2. **Pull the Image:**
The image will be automatically pulled when running docker-compose commands.

## Portainer Deployment

1. **Add Registry Authentication:**
   - In Portainer, go to Settings → Authentication
   - Add registry credentials for ghcr.io
   - Use your GitHub username and PAT token

2. **Deploy Stack:**
   - Upload both docker-compose.yml and docker-compose.prod.yml
   - Configure environment variables in Portainer UI
   - Deploy using the stack deployment feature

## Volume Management

### Development
- `uploads_data`: Named volume for uploaded files
- `./static:/app/static`: Local mount for static files
- `./templates:/app/templates`: Local mount for templates

### Production
- Only uses `uploads_data` named volume
- Development mounts are removed for security

## Maintenance

### View Container Status
```bash
docker-compose ps
```

### Update Container
```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

### Reset Everything
```bash
# Stop and remove containers, keeping volumes
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

## Troubleshooting

### Common Issues

1. **Authentication Failed:**
   - Verify GitHub PAT token has correct permissions
   - Ensure you're logged in to ghcr.io
   - Check Portainer registry credentials

2. **Container Won't Start:**
   - Check logs: `docker-compose logs cv-web-app`
   - Verify port 8080 is not in use
   - Ensure volumes have correct permissions

3. **Cannot Find Image:**
   - Verify image name and tag in compose file
   - Check if repository is public or private
   - Ensure proper authentication to ghcr.io

### Logs
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f cv-web-app
```