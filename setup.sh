#!/bin/bash

echo "🚀 Setting up E-commerce Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one using .env.example as a template"
    echo "📝 Example: cp .env.example .env"
    echo "🔧 Then edit .env with your database URL and JWT secret"
    exit 1
fi

echo "✅ Environment file found"

# Set up database schema
echo "🗄️  Setting up database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up database schema"
    echo "🔧 Please check your DATABASE_URL in .env file"
    exit 1
fi

echo "✅ Database schema set up successfully"

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npx tsx scripts/seed.ts

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to seed database with sample data"
    echo "📝 You can run 'npx tsx scripts/seed.ts' manually later"
else
    echo "✅ Database seeded successfully"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📖 The application will be available at: http://localhost:5000"
echo ""
echo "🔧 To seed the database again:"
echo "   npx tsx scripts/seed.ts"
echo ""