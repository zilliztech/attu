#!/bin/bash

# Standalone version with subpath /attu
# Access attu via http://my-server-address/attu

# Stop and remove existing nginx container if it exists
docker stop nginx-attu 2>/dev/null || true
docker rm nginx-attu 2>/dev/null || true

# Check if attu is running on port 3000
if ! nc -z localhost 3000 2>/dev/null; then
    echo "Warning: attu is not running on port 3000"
    echo "Please start attu first"
    exit 1
fi

# Create nginx config with /attu subpath
cat > /tmp/nginx-attu-subpath.conf << 'EOF'
upstream attu_backend {
    server host.docker.internal:3000;
    keepalive 64;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    access_log /var/log/nginx/attu_access.log;
    error_log /var/log/nginx/attu_error.log;

    # Socket.io with subpath
    location /attu/socket.io/ {
        rewrite ^/attu/(.*) /$1 break;
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

    # API with subpath
    location /attu/api/ {
        rewrite ^/attu/(.*) /$1 break;
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

    # Redirect /attu to /attu/
    location = /attu {
        return 301 $scheme://$http_host/attu/;
    }

    # Static assets and fallback
    location /attu/ {
        rewrite ^/attu/(.*) /$1 break;
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
EOF

# Run nginx container (need ngx_http_sub_module for sub_filter)
echo "Starting nginx container..."
docker run -d \
  --name nginx-attu \
  -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -v /tmp/nginx-attu-subpath.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:latest

echo ""
echo "Setup complete!"
echo "Attu is running at: http://localhost:3000"
echo "Attu behind nginx (subpath) is running at: http://localhost:8080/attu"
echo ""
echo "To view logs:"
echo "  docker logs -f nginx-attu"
echo ""
echo "To stop:"
echo "  docker stop nginx-attu"
echo "  docker rm nginx-attu"
