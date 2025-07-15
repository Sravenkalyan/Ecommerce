#!/bin/bash

# E-commerce Application Setup Script
echo "🚀 Setting up E-commerce Application..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your database URL and JWT secret."
    echo "📝 You need to add:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - JWT_SECRET (any random secret key)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=your_" .env; then
    echo "🗄️  Setting up database schema..."
    npx drizzle-kit push
    
    echo "🌱 Seeding database with sample data..."
    npx tsx scripts/seed.ts
    
    echo ""
    echo "✅ Setup complete! Your e-commerce application is ready."
    echo "🚀 Run 'npm run dev' to start the development server"
    echo "🌐 The app will be available at http://localhost:5000"
else
    echo ""
    echo "⚠️  Please edit the .env file with your database credentials first:"
    echo "   1. Open .env file"
    echo "   2. Set DATABASE_URL to your PostgreSQL connection string"
    echo "   3. Set JWT_SECRET to any random secret key"
    echo "   4. Run this script again: ./setup.sh"
    echo ""
    echo "📖 For database options, see README.md"
fi