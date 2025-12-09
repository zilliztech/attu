#!/bin/bash

# Standalone version that uses host.docker.internal to connect to attu
# This works when attu is running on the host machine (outside Docker)

# Stop and remove existing nginx container if it exists
docker stop nginx-attu 2>/dev/null || true
docker rm nginx-attu 2>/dev/null || true

# Check if attu is running on port 3000
if ! nc -z localhost 3000 2>/dev/null; then
    echo "Warning: attu is not running on port 3000"
    echo "Please start attu first, or use run-attu.sh instead"
    exit 1
fi

# Create a temporary nginx config with host.docker.internal
cat > /tmp/nginx-attu-standalone.conf << 'EOF'
upstream attu_backend {
    server host.docker.internal:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    access_log /var/log/nginx/attu_access.log;
    error_log /var/log/nginx/attu_error.log;

    location /socket.io/ {
        proxy_pass http://attu_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;

        proxy_buffering off;
        proxy_cache off;
    }

    location /api/ {
        proxy_pass http://attu_backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_connect_timeout 60s;

        proxy_request_buffering off;
    }

    location / {
        proxy_pass http://attu_backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_connect_timeout 60s;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
EOF

# Run nginx container with host network access
echo "Starting nginx container..."
docker run -d \
  --name nginx-attu \
  -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -v /tmp/nginx-attu-standalone.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:latest

echo ""
echo "Setup complete!"
echo "Attu is running at: http://localhost:3000"
echo "Attu behind nginx is running at: http://localhost:8080"
echo ""
echo "To view logs:"
echo "  docker logs -f nginx-attu"
echo ""
echo "To stop:"
echo "  docker stop nginx-attu"
echo "  docker rm nginx-attu"

