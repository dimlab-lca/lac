# 🇧🇫 LCA TV Burkina Faso - Multi-stage Docker Build

# Stage 1: Backend Python
FROM python:3.11-slim as backend

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Expose backend port
EXPOSE 8001

# Stage 2: Frontend Node.js
FROM node:18-alpine as frontend

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/yarn.lock* ./

# Install Node.js dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Expose frontend port
EXPOSE 8081

# Stage 3: Production image
FROM node:18-alpine as production

# Install Python
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy frontend
COPY --from=frontend /app/frontend ./frontend

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend && python server.py &' >> /app/start.sh && \
    echo 'cd /app/frontend && npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose ports
EXPOSE 8001 8081

# Start both services
CMD ["/app/start.sh"]