# Docker Deployment Guide for EC2

This guide walks you through building and running your e-commerce application as a Docker image on an EC2 instance.

## Prerequisites

### On Your Local Machine
- Docker and Docker Compose installed
- This project repository

### On Your EC2 Instance
- Docker installed
- Docker Compose installed
- Ports 5000 and 5432 open in security groups
- At least 2GB RAM (recommended 4GB)

## Step 1: Build the Docker Image Locally

1. **Clone/download your project** to your local machine
2. **Navigate to the project directory**:
   ```bash
   cd your-ecommerce-project
   ```

3. **Build the Docker image**:
   ```bash
   docker build -t ecommerce-app .
   ```

4. **Test locally** (optional):
   ```bash
   docker-compose up
   ```
   - Visit http://localhost:5000 to verify it works
   - Press Ctrl+C to stop

## Step 2: Save and Transfer the Image

### Option A: Save as TAR file
```bash
# Save the image to a tar file
docker save -o ecommerce-app.tar ecommerce-app:latest

# Transfer to EC2 (replace with your details)
scp -i your-key.pem ecommerce-app.tar ec2-user@your-ec2-ip:~/
scp -i your-key.pem docker-compose.yml ec2-user@your-ec2-ip:~/
```

### Option B: Use Docker Registry (Docker Hub)
```bash
# Tag for Docker Hub (replace 'yourusername')
docker tag ecommerce-app yourusername/ecommerce-app:latest

# Push to Docker Hub
docker push yourusername/ecommerce-app:latest
```

## Step 3: Set Up EC2 Instance

### Install Docker on EC2 (Amazon Linux 2)
```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### For Ubuntu EC2:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

**Log out and back in** for group changes to take effect.

## Step 4: Deploy on EC2

### If using TAR file:
```bash
# Load the image
docker load -i ecommerce-app.tar

# Update docker-compose.yml to use your image
# Change 'build: .' to 'image: ecommerce-app:latest'
```

### If using Docker Hub:
Update your `docker-compose.yml`:
```yaml
services:
  app:
    image: yourusername/ecommerce-app:latest  # Change this line
    # Remove 'build: .' line
```

### Start the application:
```bash
docker-compose up -d
```

## Step 5: Configure Security Groups

In AWS Console, ensure your EC2 security group allows:
- **Port 5000** (HTTP) - for the web application
- **Port 22** (SSH) - for remote access
- **Port 5432** (PostgreSQL) - only if you need external database access

## Step 6: Verify Deployment

1. **Check containers are running**:
   ```bash
   docker-compose ps
   ```

2. **View logs**:
   ```bash
   docker-compose logs -f
   ```

3. **Access your application**:
   - Visit: `http://your-ec2-public-ip:5000`
   - The database should be automatically set up with sample data

## Troubleshooting

### Container won't start:
```bash
docker-compose logs app
docker-compose logs postgres
```

### Database connection issues:
```bash
# Check if PostgreSQL is running
docker-compose exec postgres pg_isready -U postgres

# Restart if needed
docker-compose restart
```

### Port conflicts:
```bash
# Check what's using port 5000
sudo netstat -tulpn | grep 5000

# Stop other services if needed
sudo systemctl stop nginx  # example
```

## Maintenance Commands

### Update the application:
```bash
# Pull new image (if using Docker Hub)
docker-compose pull

# Restart with new image
docker-compose up -d
```

### Backup database:
```bash
docker-compose exec postgres pg_dump -U postgres ecommerce > backup.sql
```

### View application logs:
```bash
docker-compose logs -f app
```

### Stop the application:
```bash
docker-compose down
```

## Production Considerations

1. **Use environment variables** for sensitive data
2. **Set up SSL/TLS** with a reverse proxy (nginx)
3. **Configure log rotation** to prevent disk space issues
4. **Set up monitoring** and health checks
5. **Use Docker secrets** for production passwords
6. **Configure backups** for your database

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify all containers are running: `docker-compose ps`
3. Check EC2 security groups and network settings
4. Ensure adequate system resources (RAM/CPU)