#!/bin/bash

# Deploy Jahbreak Backend to bando.life
# This script should be run on the bando.life server

echo "🚀 Deploying Jahbreak Backend to bando.life..."

# Navigate to backend directory
cd /root/jahbreak/backend || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "🛑 Stopping existing jahbreak-app..."
pm2 stop jahbreak-app 2>/dev/null || true
pm2 delete jahbreak-app 2>/dev/null || true

# Start the application with PM2
echo "▶️ Starting jahbreak-app with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Show status
echo "📊 PM2 Status:"
pm2 status

# Test the API
echo "🔍 Testing API endpoint..."
sleep 2
curl -X GET http://localhost:3001/health || echo "Health check failed"

echo "✅ Deployment complete!"
echo "🌐 API should be available at https://bando.life/api/"
echo "📋 Check PM2 logs with: pm2 logs jahbreak-app"