#!/bin/bash

echo "🚀 Starting Holiday Program Aggregator Development Server"
echo ""

# Kill any existing processes
echo "🔄 Cleaning up any existing processes..."
pkill -f "next|pnpm dev" 2>/dev/null || true
sleep 1

# Check if .env exists
if [ ! -f "apps/web/.env" ]; then
    echo "⚠️  Warning: apps/web/.env file not found!"
    echo "Creating from .env.example..."
    cp apps/web/.env.example apps/web/.env
    echo "✅ Created .env file - please update with your keys!"
fi

# Start the dev server
echo ""
echo "🏃 Starting development server..."
echo "The server will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run in the foreground so you can see logs
exec pnpm dev