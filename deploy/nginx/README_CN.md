# Attu 的 Nginx 代理配置

用于在 nginx 反向代理后运行 Attu 并提供 WebSocket 支持的配置文件和脚本。

## 快速开始（测试）

使用 Docker 容器快速测试：

### 根路径代理

```bash
cd nginx
chmod +x run-attu-standalone.sh
./run-attu-standalone.sh
```

在 `http://localhost:8080` 访问 attu

### 子目录代理

```bash
cd nginx
chmod +x run-attu.sh
./run-attu.sh
```

在 `http://localhost:8080/attu` 访问 attu

## 生产环境部署

### 选项 1：根路径代理

如果您想在根路径访问 Attu（例如 `https://your-domain.com`）：

1. **复制配置文件**：

   ```bash
   cp nginx.conf /etc/nginx/sites-available/attu
   ```

2. **修改上游服务器地址**：
   编辑 `/etc/nginx/sites-available/attu`，更新 upstream 块：

   ```nginx
   upstream attu_backend {
       server localhost:3000;  # 改为您的 attu 服务器地址
       keepalive 64;
   }
   ```

3. **更新服务器设置**：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # 改为您的域名
       # ... 其余配置
   }
   ```

4. **启用站点**：

   ```bash
   ln -s /etc/nginx/sites-available/attu /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

5. **启动 Attu**（如果尚未运行）：
   ```bash
   docker run -d \
     --name attu \
     -p 3000:3000 \
     -e MILVUS_URL=your-milvus-host:19530 \
     zilliz/attu:v2.6.3
   ```

### 选项 2：子目录代理（推荐）

如果您想在子目录访问 Attu（例如 `https://your-domain.com/attu`）：

1. **复制配置文件**：

   ```bash
   cp nginx-attu-subpath.conf /etc/nginx/sites-available/attu
   ```

2. **修改上游服务器地址**：
   编辑 `/etc/nginx/sites-available/attu`：

   ```nginx
   upstream attu_backend {
       server localhost:3000;  # 改为您的 attu 服务器地址
       keepalive 64;
   }
   ```

3. **更新子目录路径**（如果不使用 `/attu`）：
   将所有 `/attu` 替换为您想要的路径（例如 `/milvus/attu`）：

   ```nginx
   location /your-path/socket.io/ {
       rewrite ^/your-path/(.*) /$1 break;
       # ...
   }
   ```

4. **更新服务器设置**：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # 改为您的域名
       # ... 其余配置
   }
   ```

5. **启用站点**：

   ```bash
   ln -s /etc/nginx/sites-available/attu /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

6. **启动 Attu 并设置 HOST_URL**：

   ```bash
   docker run -d \
     --name attu \
     -p 3000:3000 \
     -e MILVUS_URL=your-milvus-host:19530 \
     -e HOST_URL=/attu \
     zilliz/attu:v2.6.3
   ```

   **重要**：`HOST_URL` 必须与 nginx 子目录路径匹配。

### 集成到现有 Nginx 配置

如果您已有 nginx 配置文件，添加以下配置块：

**对于根路径代理**，在现有的 `server` 块中添加以下 location 块：

```nginx
# WebSocket 和 Socket.IO 支持
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

# API 端点
location /api/ {
    proxy_pass http://attu_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
}

# 前端
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

**对于子目录代理**，添加以下 location 块：

```nginx
location /attu/socket.io/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... 与上面相同的代理设置
}

location /attu/api/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... 与上面相同的代理设置
}

location = /attu {
    return 301 $scheme://$http_host/attu/;
}

location /attu/ {
    rewrite ^/attu/(.*) /$1 break;
    proxy_pass http://attu_backend;
    # ... 与上面相同的代理设置
}
```

别忘了在顶层添加 upstream 块：

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

## 配置参数说明

### 上游服务器

- **`server`**：Attu 运行的地址
  - `localhost:3000` - Attu 在同一台机器上
  - `192.168.1.100:3000` - Attu 在不同机器上
  - `attu-container:3000` - Attu 容器名称（Docker 网络）

### 服务器设置

- **`listen`**：nginx 监听的端口（80 用于 HTTP，443 用于 HTTPS）
- **`server_name`**：您的域名
- **`client_max_body_size`**：最大请求体大小（默认：100M）

### WebSocket 设置

- **`proxy_read_timeout`**：WebSocket 连接超时（86400s = 24 小时）
- **`proxy_buffering off`**：WebSocket 正常工作所需

### HOST_URL 环境变量

使用子目录代理时，设置 `HOST_URL` 以匹配您的 nginx 路径：

- **仅路径**（推荐）：`HOST_URL=/attu` 或 `HOST_URL=/attu/`
- **完整 URL**：`HOST_URL=https://your-domain.com/attu`

## SSL/TLS 配置

要添加 SSL 支持，修改 server 块：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... 其余配置
}

# 将 HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 测试

### 验证配置

```bash
nginx -t
```

### 测试端点

1. **前端**：`curl http://your-domain.com` 或 `curl http://your-domain.com/attu`
2. **API**：`curl http://your-domain.com/api/v1/health` 或 `curl http://your-domain.com/attu/api/v1/health`
3. **WebSocket**：打开浏览器控制台，检查网络标签页中的 WebSocket 连接（状态 101）

## 故障排除

### WebSocket 连接失败

1. 检查 nginx 错误日志：`tail -f /var/log/nginx/error.log`
2. 验证上游服务器可访问：`curl http://localhost:3000`
3. 检查 nginx 配置：`nginx -t`
4. 对于子目录：验证 `HOST_URL` 是否与 nginx 路径匹配：
   ```bash
   docker exec attu env | grep HOST_URL
   ```

### 502 Bad Gateway

- 确保 Attu 正在运行：`curl http://localhost:3000`
- 检查 nginx 配置中的上游服务器地址
- 验证 nginx 和 Attu 之间的网络连接

### 子目录代理问题

1. 验证 `HOST_URL` 是否与 nginx 子目录路径完全匹配
2. 检查 nginx 配置中的路径重写（应将 `/attu/*` 重写为 `/*`）
3. 检查浏览器控制台中的 WebSocket 连接错误
4. 测试 API 端点：`curl http://your-domain.com/attu/api/v1/health`

## 文件

- `nginx.conf` - 根路径代理配置模板
- `nginx-attu-subpath.conf` - 子目录代理配置模板
- `run-attu.sh` - 测试脚本：同时运行 attu 和 nginx（子目录）
- `run-attu-standalone.sh` - 测试脚本：仅运行 nginx（根路径）
- `run-attu-standalone-subpath.sh` - 测试脚本：仅运行 nginx（子目录）

## 参考资料

- [Nginx WebSocket 代理](http://nginx.org/en/docs/http/websocket.html)
- [Socket.IO 文档](https://socket.io/docs/v4/)
- [Attu 文档](https://github.com/zilliztech/attu)
