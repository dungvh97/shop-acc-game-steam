#!/bin/bash

# Frontend Deployment Script
# This script helps build and deploy the frontend for different environments

set -e

echo "🚀 Starting frontend deployment..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Create environment files if they don't exist
echo "📝 Creating environment files..."

if [ ! -f ".env.development" ]; then
    echo "VITE_BACKEND_URL=http://localhost:8080" > .env.development
    echo "NODE_ENV=development" >> .env.development
    echo "✅ Created .env.development"
fi

if [ ! -f ".env.production" ]; then
    echo "VITE_BACKEND_URL=https://api.gurroshop.com" > .env.production
    echo "NODE_ENV=production" >> .env.production
    echo "✅ Created .env.production"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📁 Build output is in the 'dist' directory"
echo ""
echo "🧪 Testing production build..."
echo "   Run: npm run preview"
echo "   Then check browser console for configuration logs"
echo ""
echo "🌐 For production deployment:"
echo "   - Upload the contents of 'dist' to your web server"
echo "   - Ensure your backend is running on api.gurroshop.com"
echo "   - Configure your web server to serve the static files"
echo ""
echo "🔧 For development:"
echo "   - Run 'npm run dev' to start the development server"
echo "   - Backend should be running on localhost:8080"
echo ""
echo "📋 Environment files created:"
echo "   - .env.development (localhost:8080)"
echo "   - .env.production (api.gurroshop.com)"
