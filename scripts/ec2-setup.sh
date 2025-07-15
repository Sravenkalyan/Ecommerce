#!/bin/bash
# EC2 Setup Script for E-commerce Application
# Run this script on your EC2 instance to set up Docker and deploy the app

set -e

echo "🚀 Setting up E-commerce Application on EC2..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
fi

# Install Docker based on OS
if [[ "$OS" == *"Amazon Linux"* ]]; then
    echo "📦 Installing Docker on Amazon Linux..."
    sudo yum update -y
    sudo yum install -y docker
    sudo service docker start
    sudo chkconfig docker on
    sudo usermod -a -G docker ec2-user
elif [[ "$OS" == *"Ubuntu"* ]]; then
    echo "📦 Installing Docker on Ubuntu..."
    sudo apt update
    sudo apt install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ubuntu
else
    echo "⚠️  Unsupported OS: $OS"
    echo "Please install Docker manually"
    exit 1
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/ecommerce-app
cd ~/ecommerce-app

echo "✅ Docker setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload your application files to ~/ecommerce-app/"
echo "2. If using TAR file: docker load -i ecommerce-app.tar"
echo "3. Copy .env.production to .env and update passwords"
echo "4. Run: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "⚠️  Log out and back in for Docker group changes to take effect!"