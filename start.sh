#!/bin/bash

# start.sh
# Unified process runner for Pantheon Cloud Run deployment

# Exit on any error
set -e

# Use the port provided by Cloud Run, default to 8080
TARGET_PORT=${PORT:-8080}

echo "========================================="
echo "🔱 Starting Pantheon Unified Stack"
echo "========================================="

# 1. Start FastAPI backend in the background
# We bind to localhost only since it's internal to the container
echo "🚀 [Backend] Launching FastAPI on port 8000..."
cd /app/agent && uvicorn sse_bridge:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 2. Start Next.js frontend in the foreground
# This will be the main process that Cloud Run monitors
echo "🚀 [Frontend] Launching Next.js on port $TARGET_PORT..."
cd /app/apps/web && pnpm start --port $TARGET_PORT

# Cleanup (if Next.js exits)
kill $BACKEND_PID
