# Docker Hub Deployment Guide

Deploy your e-commerce application to EC2 using Docker Hub for easy image distribution and updates.

## Step 1: Prepare for Docker Hub

### Create Docker Hub Account
1. Go to https://hub.docker.com
2. Create a free account
3. Create a new repository named `ecommerce-app`

### Login to Docker Hub locally
```bash
docker login
# Enter your Docker Hub username and password
```

## Step 2: Build and Push to Docker Hub

### Build the image with proper tag
```bash
# Replace 'yourusername' with your Docker Hub username
docker build -t yourusername/ecommerce-app:latest .
```

### Test locally (optional)
```bash
# Update docker-compose.yml temporarily
docker-compose up
```

### Push to Docker Hub
```bash
docker push yourusername/ecommerce-app:latest
```

### Create version tags (recommended)
```bash
# Tag with version for better release management
docker tag yourusername/ecommerce-app:latest yourusername/ecommerce-app:v1.0.0
docker push yourusername/ecommerce-app:v1.0.0
```

## Step 3: Set Up EC2 Instance

### Copy setup script to EC2
```bash
scp -i your-key.pem scripts/ec2-setup.sh ec2-user@your-ec2-ip:~/
```

### Run setup on EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
chmod +x ec2-setup.sh && ./ec2-setup.sh
# Log out and back in for Docker group changes
```

## Step 4: Deploy Application Files

### Transfer configuration files
```bash
# From your local machine
scp -i your-key.pem docker-compose.dockerhub.yml ec2-user@your-ec2-ip:~/ecommerce-app/docker-compose.yml
scp -i your-key.pem .env.production ec2-user@your-ec2-ip:~/ecommerce-app/.env
```

### Configure environment
```bash
# On EC2 instance
cd ~/ecommerce-app
nano .env  # Update passwords and secrets
```

## Step 5: Deploy Application

### Pull and start
```bash
# Pull the latest image
docker-compose pull

# Start the application
docker-compose up -d
```

### Verify deployment
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test the application
curl http://localhost:5000/api/categories
```

## Step 6: Configure Security Groups

In AWS Console:
- **Port 5000**: HTTP access to your application
- **Port 22**: SSH access
- **Port 80/443**: If using reverse proxy (recommended)

## Updates and Maintenance

### Deploy new versions
```bash
# Build new version locally
docker build -t yourusername/ecommerce-app:v1.1.0 .
docker push yourusername/ecommerce-app:v1.1.0

# Update on EC2
ssh -i your-key.pem ec2-user@your-ec2-ip
cd ~/ecommerce-app
docker-compose pull
docker-compose up -d
```

### Rollback if needed
```bash
# Update docker-compose.yml to previous version
# image: yourusername/ecommerce-app:v1.0.0
docker-compose up -d
```

## Production Setup

### Use nginx reverse proxy
```bash
sudo yum install -y nginx
# Configure nginx to proxy port 80 to 5000
# Set up SSL with Let's Encrypt
```

### Set up monitoring
```bash
# Install monitoring tools
docker run -d --name monitoring \
  -p 3000:3000 \
  grafana/grafana
```

## Backup Strategy

### Database backups
```bash
# Create backup script
echo '#!/bin/bash
docker-compose exec -T postgres pg_dump -U postgres ecommerce > backup_$(date +%Y%m%d_%H%M%S).sql
' > backup.sh
chmod +x backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /home/ec2-user/ecommerce-app/backup.sh
```

## Troubleshooting

### Common issues
```bash
# Image pull fails
docker login  # Re-authenticate

# Port conflicts
sudo netstat -tulpn | grep 5000
sudo systemctl stop nginx  # If needed

# Database connection issues
docker-compose logs postgres
docker-compose restart postgres
```

### Performance optimization
```bash
# Increase container resources if needed
# Edit docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
#       cpus: '1.0'
```

Your application will be available at `http://your-ec2-ip:5000`