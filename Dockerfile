# Use Python 3.11 as base (it's lighter than a full node image + python)
FROM python:3.11-slim

# Install Node.js 22 and pnpm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy pnpm workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy apps/web and packages metadata
COPY apps/web/package.json ./apps/web/
COPY packages ./packages/

# Install Node dependencies
# Note: we use --frozen-lockfile for consistency
RUN pnpm install

# Copy the rest of the frontend
COPY apps/web ./apps/web/

# Build frontend
# NEXT_PUBLIC_SSE_BRIDGE_URL is used in server routes, so runtime env is fine,
# but we set a default here just in case of build-time checks.
ENV NEXT_PUBLIC_SSE_BRIDGE_URL=http://localhost:8000
RUN pnpm --filter web build

# Copy agent backend
COPY agent ./agent/

# Install Python dependencies
RUN pip install --no-cache-dir -r agent/requirements.txt

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port (Cloud Run sets $PORT, default to 8080)
EXPOSE 8080

# Run the unified start script
CMD ["./start.sh"]
