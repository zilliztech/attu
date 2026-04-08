# Nginx Reverse Proxy for Attu

Nginx configuration to run Attu behind a reverse proxy.

Attu v3 is a standard HTTP server — no special WebSocket or Socket.IO configuration is required.

## Quick Start

```bash
cd deploy/nginx
chmod +x run-attu-standalone.sh
./run-attu-standalone.sh
```

Access Attu at `http://localhost:8080`.

## Production Deployment

### 1. Copy the configuration

```bash
cp nginx.conf /etc/nginx/sites-available/attu
```

### 2. Edit the upstream server

```nginx
upstream attu_backend {
    server localhost:3000;  # Change to your Attu server address
    keepalive 64;
}
```

### 3. Update server settings

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Change to your domain
    # ...
}
```

### 4. Enable and reload

```bash
ln -s /etc/nginx/sites-available/attu /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. Start Attu

```bash
docker run -d --name attu \
  -p 3000:3000 \
  -e MILVUS_ADDRESS=your-milvus-host:19530 \
  zilliz/attu:v3.0.0-beta.1
```

## SSL / TLS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... proxy configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Configuration Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `server` (upstream) | `attu:3000` | Attu server address |
| `listen` | `80` | Nginx listen port |
| `client_max_body_size` | `100M` | Max upload size (data import) |
| `proxy_read_timeout` | `300s` | Request timeout |

## Troubleshooting

**502 Bad Gateway**
- Verify Attu is running: `curl http://localhost:3000`
- Check the upstream address in nginx config
- Check logs: `tail -f /var/log/nginx/attu_error.log`

**Connection timeout**
- Increase `proxy_read_timeout` for large data operations

## Files

- `nginx.conf` — Reverse proxy configuration
- `run-attu-standalone.sh` — Test script: run nginx proxy for an existing Attu instance
- `run-attu.sh` — Test script: run both Attu and nginx with Docker
