#!/bin/bash
# Docker Hub Deployment Script
# Usage: ./deploy-dockerhub.sh yourusername v1.0.0

set -e

DOCKER_USERNAME=${1:-"yourusername"}
VERSION=${2:-"latest"}
IMAGE_NAME="$DOCKER_USERNAME/ecommerce-app:$VERSION"

echo "🚀 Deploying E-commerce App to Docker Hub"
echo "Image: $IMAGE_NAME"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo "🔐 Please login to Docker Hub first:"
    docker login
fi

echo "🏗️  Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo "📤 Pushing to Docker Hub..."
docker push "$IMAGE_NAME"

# Also tag and push as latest if version is specified
if [ "$VERSION" != "latest" ]; then
    echo "🏷️  Tagging as latest..."
    docker tag "$IMAGE_NAME" "$DOCKER_USERNAME/ecommerce-app:latest"
    docker push "$DOCKER_USERNAME/ecommerce-app:latest"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps for EC2 deployment:"
echo "1. Update .env file with: DOCKER_IMAGE=$IMAGE_NAME"
echo "2. On EC2: docker-compose pull && docker-compose up -d"
echo ""
echo "🌐 Your image is now available at:"
echo "   https://hub.docker.com/r/$DOCKER_USERNAME/ecommerce-app"