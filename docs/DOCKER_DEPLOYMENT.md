# Docker Deployment Guide for Cine Viewer

Complete guide for deploying Cine Viewer using Docker and Docker Compose, with production-ready configurations and automated update scheduling.

## Prerequisites

1. **Docker & Docker Compose** installed on your system
   - Docker 20.10+ recommended
   - Docker Compose 2.0+ recommended
2. **GitHub Container Registry** access (public repository - no authentication needed)
3. **Optional**: Portainer for web-based container management

## Quick Start

### Basic Deployment

Pull and run the latest version:

```bash
# Pull the image
docker pull ghcr.io/madmanhulk/cine-viewer:latest

# Run the container
docker run -d \
  --name cine-viewer \
  -p 8080:8080 \
  --restart always \
  ghcr.io/madmanhulk/cine-viewer:latest
```

Access the application at: **http://localhost:8080**

### Docker Compose Deployment (Recommended)

1. **Create or navigate to your project directory:**
```bash
mkdir cine-viewer-deploy
cd cine-viewer-deploy
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  cv-web-app:
    image: ghcr.io/madmanhulk/cine-viewer:latest
    container_name: cine-viewer-webapp
    ports:
      - "8080:8080"
    volumes:
      - uploads_data:/app/uploads
    environment:
      - FLASK_ENV=production
      - PYTHONUNBUFFERED=1
    restart: always

volumes:
  uploads_data:
    driver: local
```

3. **Deploy:**
```bash
docker-compose up -d
```

4. **View logs:**
```bash
docker-compose logs -f cv-web-app
```

## Configuration

### Environment Variables

Available environment variables for customization:

```yaml
environment:
  - FLASK_ENV=production              # Application environment (production/development)
  - PYTHONUNBUFFERED=1                # Python output buffering (keep as 1 for logs)
  - MAX_CONTENT_LENGTH=36700160       # Max upload size in bytes (default: 35MB)
```

### Port Configuration

Change the host port (default 8080) by modifying the ports mapping:

```yaml
ports:
  - "8080:8080"  # Change first number: "HOST_PORT:CONTAINER_PORT"
```

Examples:
- Use port 80: `"80:8080"`
- Use port 5000: `"5000:8080"`

### Volume Management

The application uses volumes for persistent data:

**uploads_data**: Stores temporary uploaded images
```yaml
volumes:
  - uploads_data:/app/uploads
```

**Development volumes** (optional - for local development):
```yaml
volumes:
  - uploads_data:/app/uploads
  - ./src/cineviewer/static:/app/static      # Live-reload static files
  - ./src/cineviewer/templates:/app/templates # Live-reload templates
```

## Production Deployment

### Recommended Production Setup

```yaml
version: '3.8'

services:
  cv-web-app:
    image: ghcr.io/madmanhulk/cine-viewer:latest
    container_name: cine-viewer-webapp
    ports:
      - "8080:8080"
    volumes:
      - uploads_data:/app/uploads
    environment:
      - FLASK_ENV=production
      - PYTHONUNBUFFERED=1
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

volumes:
  uploads_data:
    driver: local
```

### Behind Reverse Proxy (Nginx/Traefik)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name cineviewer.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle large image uploads
        client_max_body_size 35M;
    }
}
```

## Portainer Deployment

### Stack Deployment

1. **Access Portainer UI**
   - Navigate to your Portainer instance
   - Go to **Stacks** → **Add stack**

2. **Create Stack**
   - Name: `cine-viewer`
   - Build method: **Web editor**
   - Paste the docker-compose.yml content

3. **Deploy**
   - Click **Deploy the stack**
   - Wait for container to start

4. **Verify**
   - Check **Containers** list
   - Ensure `cine-viewer-webapp` is running
   - Access at `http://your-server-ip:8080`

### Automated Updates with Portainer

Set up automatic daily updates at 3 AM using Portainer webhooks:

#### Step 1: Create Webhook in Portainer

1. Go to **Stacks** → Select your `cine-viewer` stack
2. Scroll to **Webhooks** section
3. Click **Add webhook**
4. Copy the webhook URL (format: `https://portainer.url/api/webhooks/xxx-xxx-xxx`)

#### Step 2: Schedule Webhook Calls

**Option A: Host Cron Job (Recommended)**

On your Docker host machine:

```bash
# Edit crontab
crontab -e

# Add this line (replace with your webhook URL)
0 3 * * * curl -X POST https://your-portainer-url/api/webhooks/your-webhook-id
```

This runs daily at 3:00 AM and:
- Pulls the latest `ghcr.io/madmanhulk/cine-viewer:latest` image
- Recreates the container with the new image
- Preserves your data volumes

**Option B: Scheduled Task (Windows)**

Create a PowerShell script `update-cineviewer.ps1`:
```powershell
Invoke-WebRequest -Uri "https://your-portainer-url/api/webhooks/your-webhook-id" -Method POST
```

Schedule in Task Scheduler:
- Trigger: Daily at 3:00 AM
- Action: Run PowerShell script
- Time zone: America/Detroit (or your timezone)

**Option C: External Cron Service**

Use services like:
- **cron-job.org** (free, web-based)
- **EasyCron** (paid, reliable)
- **Healthchecks.io** (with webhook feature)

Configure to POST to your webhook URL at your desired time.

## Maintenance

### Update to Latest Version

```bash
# Pull latest image
docker-compose pull

# Recreate container with new image
docker-compose up -d

# View updated version
docker-compose exec cv-web-app cat /app/VERSION
```

### View Container Logs

```bash
# Follow logs
docker-compose logs -f cv-web-app

# Last 100 lines
docker-compose logs --tail=100 cv-web-app

# With timestamps
docker-compose logs -f -t cv-web-app
```

### Check Container Status

```bash
# View running containers
docker-compose ps

# Detailed container info
docker inspect cine-viewer-webapp

# Resource usage
docker stats cine-viewer-webapp
```

### Backup and Restore

**Backup uploaded data:**
```bash
# Create backup
docker run --rm \
  -v cine-viewer-deploy_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/cineviewer-backup-$(date +%Y%m%d).tar.gz -C /data .

# List backups
ls -lh cineviewer-backup-*.tar.gz
```

**Restore from backup:**
```bash
# Stop container
docker-compose down

# Restore data
docker run --rm \
  -v cine-viewer-deploy_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/cineviewer-backup-20251027.tar.gz -C /data

# Start container
docker-compose up -d
```

### Clean Up

```bash
# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including volumes (⚠️ DATA LOSS)
docker-compose down -v

# Remove unused images
docker image prune -a
```

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs cv-web-app
```

**Common issues:**
- Port 8080 already in use → Change port mapping
- Volume permission issues → Check volume permissions
- Memory constraints → Increase Docker memory limits

**Solution:**
```bash
# Check what's using port 8080
sudo lsof -i :8080
# or
sudo netstat -tulpn | grep 8080

# Kill the process or change port in docker-compose.yml
```

### Cannot Access Application

**Verify container is running:**
```bash
docker ps | grep cine-viewer
```

**Check network connectivity:**
```bash
# From host
curl http://localhost:8080

# Get container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' cine-viewer-webapp
```

**Firewall issues:**
```bash
# Allow port 8080 (Ubuntu/Debian)
sudo ufw allow 8080

# Allow port 8080 (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### Image Pull Issues

**Authentication error (if needed):**
```bash
# Login to GitHub Container Registry
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Verify login
docker pull ghcr.io/madmanhulk/cine-viewer:latest
```

**Network issues:**
```bash
# Test connectivity
ping ghcr.io

# Manual pull with verbose output
docker pull ghcr.io/madmanhulk/cine-viewer:latest --debug
```

### Performance Issues

**Check resource usage:**
```bash
docker stats cine-viewer-webapp
```

**Increase resources in docker-compose.yml:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
```

**Clear uploads volume:**
```bash
docker-compose exec cv-web-app rm -rf /app/uploads/*
```

### Application Errors

**View application logs:**
```bash
# Real-time logs
docker-compose logs -f cv-web-app

# Filter for errors
docker-compose logs cv-web-app | grep -i error

# Python traceback
docker-compose logs cv-web-app | grep -A 20 "Traceback"
```

**Restart container:**
```bash
docker-compose restart cv-web-app
```

**Full reset:**
```bash
docker-compose down
docker-compose up -d
```

## Health Checks

### Manual Health Check

```bash
# Check if application responds
curl -I http://localhost:8080

# Expected response
HTTP/1.1 200 OK
```

### Add Health Check to docker-compose.yml

```yaml
services:
  cv-web-app:
    # ... other config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Security Best Practices

1. **Keep Image Updated**: Enable automatic updates or update weekly
2. **Use Non-Root User**: Image already runs as non-root user
3. **Limit Resources**: Set CPU and memory limits
4. **Network Isolation**: Use Docker networks for multi-container setups
5. **Read-Only Root**: Optional hardening (may affect uploads)

```yaml
services:
  cv-web-app:
    # ... other config ...
    read_only: false  # Keep false due to upload directory
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## Advanced Configuration

### Multi-Instance Deployment (Load Balancing)

Use Docker Compose scaling:

```bash
docker-compose up -d --scale cv-web-app=3
```

Add Nginx load balancer or use Docker Swarm for production scaling.

### Monitoring Integration

**With Prometheus:**
```yaml
services:
  cv-web-app:
    # ... other config ...
    labels:
      - "prometheus.scrape=enabled"
      - "prometheus.port=8080"
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/madmanhulk/cine-viewer/issues
- Documentation: https://github.com/madmanhulk/cine-viewer
- Website: https://reidpetro.com

## Version Information

**Current Version:** 1.1  
**Image:** `ghcr.io/madmanhulk/cine-viewer:latest`  
**Base Image:** Python 3.11-slim  
**Architecture:** linux/amd64, linux/arm64