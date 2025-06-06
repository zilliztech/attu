# Using Attu Behind a Proxy with Nginx

This document provides instructions on how to configure Nginx to proxy requests to Attu, a web-based GUI for Milvus.

## Prerequisites

1. **Nginx**: Ensure Nginx is installed on your server. You can install it using your package manager:

```bash
sudo apt-get install nginx # For Debian/Ubuntu
sudo yum install nginx # For CentOS/RHEL
brew install nginx # For Mac OS
```

2. **Attu**:

```bash
docker run -p 3000:3000 -e HOST_URL=http://localhost:8080/attu zilliz/attu:v2.4.4
```

The `HOST_URL` environment variable specifies the URL where Attu is hosted. In this case, it is set to `http://localhost:8080/attu/`.

## Nginx Configuration

1. Open your Nginx configuration file for editing. This is typically located at `/etc/nginx/nginx.conf` or in the `/etc/nginx/sites-available/` directory.

2. Add the following server block configuration:

```nginx
server {
  listen 8080;
  server_name localhost;

  location /attu/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

}
```

This configuration sets up a proxy for Attu running on `localhost:3000` and maps it to `localhost:8080/attu/`, directing all requests to the specified location.

3. Save the configuration file and exit the editor.

## Restart Nginx

After updating the Nginx configuration, restart the Nginx service to apply the changes:

```bash
sudo systemctl restart nginx # for Debian/Ubuntu
sudo systemctl restart nginx # for CentOS/RHEL
brew services restart nginx # for Mac OS
```

## Access Attu

You can now access Attu through the proxy at `http://localhost:8080/attu/`.

## Troubleshooting

- **Nginx Fails to Start**: Check the Nginx error logs located at `/var/log/nginx/error.log` for any configuration errors.
- **Attu Not Accessible**: Ensure that Attu is running on the specified port and that there are no firewall rules blocking access.

## Conclusion

By following these steps, you can configure Nginx to proxy requests to Attu, allowing you to use Attu behind a proxy server. This setup is useful for environments where direct access to Attu is restricted or when you want to centralize access through a single entry point.

For further assistance, refer to the official [Nginx documentation](https://nginx.org/en/docs/) and [Attu documentation](https://github.com/milvus-io/attu).

---

Feel free to modify this document according to your specific requirements.
