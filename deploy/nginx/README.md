# Nginx Proxy Configuration for Attu

Nginx configuration files and scripts to run Attu behind an nginx reverse proxy with WebSocket support.

## Quick Start (Testing)

For quick testing with Docker containers:

### Root Path Proxy

```bash
cd nginx
chmod +x run-attu-standalone.sh
./run-attu-standalone.sh
```

Access attu at `http://localhost:8080`

### Subdirectory Proxy

```bash
cd nginx
chmod +x run-attu.sh
./run-attu.sh
```

Access attu at `http://localhost:8080/attu`

## Production Deployment

### Option 1: Root Path Proxy

If you want to access Attu at the root path (e.g., `https://your-domain.com`):

1. **Copy the configuration**:

   ```bash
   cp nginx.conf /etc/nginx/sites-available/attu
   ```

2. **Modify the upstream server**:
   Edit `/etc/nginx/sites-available/attu` and update the upstream block:

   ```nginx
   upstream attu_backend {
       server localhost:3000;  # Change to your attu server address
       keepalive 64;
   }
   ```

3. **Update server settings**:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Change to your domain
       # ... rest of configuration
   }
   ```

4. **Enable the site**:

   ```bash
   ln -s /etc/nginx/sites-available/attu /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

5. **Start Attu** (if not already running):
   ```bash
   docker run -d \
     --name attu \
     -p 3000:3000 \
     -e MILVUS_URL=your-milvus-host:19530 \
     zilliz/attu:v2.6.3
   ```

### Option 2: Subdirectory Proxy (Recommended)

If you want to access Attu at a subdirectory (e.g., `https://your-domain.com/attu`):

1. **Copy the configuration**:

   ```bash
   cp nginx-attu-subpath.conf /etc/nginx/sites-available/attu
   ```

2. **Modify the upstream server**:
   Edit `/etc/nginx/sites-available/attu`:

   ```nginx
   upstream attu_backend {
       server localhost:3000;  # Change to your attu server address
       keepalive 64;
   }
   ```

3. **Update the subdirectory path** (if not using `/attu`):
   Replace all occurrences of `/attu` with your desired path (e.g., `/milvus/attu`):

   ```nginx
   location /your-path/socket.io/ {
       rewrite ^/your-path/(.*) /$1 break;
       # ...
   }
   ```

4. **Update server settings**:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Change to your domain
       # ... rest of configuration
   }
   ```

5. **Enable the site**:

   ```bash
   ln -s /etc/nginx/sites-available/attu /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

6. **Start Attu with HOST_URL**:

   ```bash
   docker run -d \
     --name attu \
     -p 3000:3000 \
     -e MILVUS_URL=your-milvus-host:19530 \
     -e HOST_URL=/attu \
     zilliz/attu:v2.6.3
   ```

   **Important**: The `HOST_URL` must match the nginx subdirectory path.

### Integrating into Existing Nginx Configuration

If you already have an nginx configuration file, add the following blocks:

**For root path proxy**, add these location blocks to your existing `server` block:

```nginx
# WebSocket and Socket.IO support
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
    proxy_buffering off;
}

# API endpoints
location /api/ {
    proxy_pass http://attu_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}

# Frontend
location / {
    proxy_pass http://attu_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
}
```

**For subdirectory proxy**, add these location blocks:

```nginx
location /attu/socket.io/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... same proxy settings as above
}

location /attu/api/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... same proxy settings as above
}

location = /attu {
    return 301 $scheme://$http_host/attu/;
}

location /attu/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... same proxy settings as above
}
```

Don't forget to add the upstream block at the top level:

```nginx
upstream attu_backend {
    server localhost:3000;
    keepalive 64;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

## Configuration Parameters

### Upstream Server

- **`server`**: The address where Attu is running
  - `localhost:3000` - Attu on same machine
  - `192.168.1.100:3000` - Attu on different machine
  - `attu-container:3000` - Attu container name (Docker network)

### Server Settings

- **`listen`**: Port nginx listens on (80 for HTTP, 443 for HTTPS)
- **`server_name`**: Your domain name
- **`client_max_body_size`**: Maximum request body size (default: 100M)

### WebSocket Settings

- **`proxy_read_timeout`**: WebSocket connection timeout (86400s = 24 hours)
- **`proxy_buffering off`**: Required for WebSocket to work properly

### HOST_URL Environment Variable

When using subdirectory proxy, set `HOST_URL` to match your nginx path:

- **Path only** (recommended): `HOST_URL=/attu` or `HOST_URL=/attu/`
- **Full URL**: `HOST_URL=https://your-domain.com/attu`

## SSL/TLS Configuration

To add SSL support, modify the server block:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Testing

### Verify Configuration

```bash
nginx -t
```

### Test Endpoints

1. **Frontend**: `curl http://your-domain.com` or `curl http://your-domain.com/attu`
2. **API**: `curl http://your-domain.com/api/v1/health` or `curl http://your-domain.com/attu/api/v1/health`
3. **WebSocket**: Open browser console and check Network tab for WebSocket connection (Status 101)

## Troubleshooting

### WebSocket Connection Fails

1. Check nginx error log: `tail -f /var/log/nginx/error.log`
2. Verify upstream server is accessible: `curl http://localhost:3000`
3. Check nginx configuration: `nginx -t`
4. For subdirectory: Verify `HOST_URL` matches nginx path:
   ```bash
   docker exec attu env | grep HOST_URL
   ```

### 502 Bad Gateway

- Ensure Attu is running: `curl http://localhost:3000`
- Check upstream server address in nginx config
- Verify network connectivity between nginx and Attu

### Subdirectory Proxy Issues

1. Verify `HOST_URL` matches the nginx subdirectory path exactly
2. Check path rewriting in nginx config (should rewrite `/attu/*` to `/*`)
3. Check browser console for WebSocket connection errors
4. Test API endpoint: `curl http://your-domain.com/attu/api/v1/health`

## Files

- `nginx.conf` - Root path proxy configuration template
- `nginx-attu-subpath.conf` - Subdirectory proxy configuration template
- `run-attu.sh` - Test script: run both attu and nginx (subdirectory)
- `run-attu-standalone.sh` - Test script: run nginx only (root path)
- `run-attu-standalone-subpath.sh` - Test script: run nginx only (subdirectory)

## References

- [Nginx WebSocket Proxying](http://nginx.org/en/docs/http/websocket.html)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Attu Documentation](https://github.com/zilliztech/attu)
