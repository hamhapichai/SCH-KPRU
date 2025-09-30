# 🔄 Reverse Proxy & SSL Setup Guide

## 📋 Overview

โปรเจกต์ SCH-KPRU ใช้ **Nginx** เป็น reverse proxy ที่มีความสามารถ:

- ✅ Load balancing
- ✅ SSL/TLS termination  
- ✅ Static file serving & caching
- ✅ Rate limiting & security
- ✅ Health checks
- ✅ CORS handling

## 🏗️ Architecture

```
Internet → Nginx (Port 80/443) → Backend (Port 8080) / Frontend (Port 3000)
```

### Request Routing:
- `https://yourdomain.com/` → Frontend (Next.js)
- `https://yourdomain.com/api/` → Backend (ASP.NET Core)
- `https://yourdomain.com/swagger/` → Backend (Swagger UI)
- `https://yourdomain.com/health` → Nginx (Direct response)

## 🔧 Production Setup

### 1. Replace Nginx Configuration

```bash
# บน production server
cd /path/to/SCH-KPRU

# Backup current config
cp nginx/nginx.conf nginx/nginx.conf.backup

# Use production config
cp nginx/nginx-production.conf nginx/nginx.conf

# Edit domain name
nano nginx/nginx.conf
# เปลี่ยน "yourdomain.com" เป็น domain จริงของคุณ
```

### 2. SSL Certificate Setup

#### Option 1: Let's Encrypt (Recommended)

```bash
# ติดตั้ง Certbot
sudo apt update
sudo apt install certbot -y

# หยุด nginx ชั่วคราว
docker-compose -f docker-compose.prod.yml stop nginx

# สร้าง SSL certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# Copy certificates ไปยัง nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*

# Start nginx again
docker-compose -f docker-compose.prod.yml start nginx
```

#### Option 2: CloudFlare SSL

```bash
# ถ้าใช้ CloudFlare, download SSL certificates จาก dashboard
# และวางไว้ใน nginx/ssl/
mkdir -p nginx/ssl
# Upload cert.pem และ key.pem
```

#### Option 3: Self-signed (Development only)

```bash
make ssl-generate
```

### 3. Auto-renewal SSL

```bash
# เพิ่ม cron job สำหรับ auto-renewal
sudo crontab -e

# เพิ่มบรรทัดนี้ (renew ทุกวันเวลา 3:00 AM)
0 3 * * * /usr/bin/certbot renew --quiet --post-hook "cd /path/to/SCH-KPRU && docker restart sch-kpru-nginx-prod"
```

### 4. DNS Configuration

```dns
# A Records
yourdomain.com.     → YOUR_SERVER_IP
www.yourdomain.com. → YOUR_SERVER_IP

# CNAME (Optional)
staging.yourdomain.com. → yourdomain.com.
```

## 🛡️ Security Features

### 1. Rate Limiting

```nginx
# API rate limit: 10 requests/second
location /api/ {
    limit_req zone=api burst=20 nodelay;
}

# Auth rate limit: 5 requests/second  
location /api/auth/ {
    limit_req zone=auth burst=10 nodelay;
}
```

### 2. Security Headers

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'";

# Other security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
```

### 3. IP Whitelisting (Optional)

```nginx
# สำหรับ admin routes
location /admin/ {
    allow 192.168.1.0/24;  # Office network
    allow 10.0.0.0/8;      # VPN network
    deny all;
    
    proxy_pass http://backend_api;
}
```

## ⚡ Performance Optimization

### 1. Caching Strategy

```nginx
# API caching (5 minutes)
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_valid 404 1m;
}

# Static files (1 year)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Compression

```nginx
# Gzip compression
gzip on;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    application/json
    application/javascript
    text/xml
    application/xml;
```

### 3. Load Balancing

```nginx
# Multiple backend servers
upstream backend_api {
    least_conn;
    server backend1:8080 max_fails=3 fail_timeout=30s;
    server backend2:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

## 📊 Monitoring & Logging

### 1. Log Configuration

```nginx
# Detailed logging with timing
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                'rt=$request_time uct="$upstream_connect_time"';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;
```

### 2. Health Checks

```bash
# ตรวจสอบ nginx status
curl -I https://yourdomain.com/health

# ตรวจสอบ upstream health
curl -I https://yourdomain.com/api/health
```

### 3. Log Analysis

```bash
# ดู real-time logs
docker logs -f sch-kpru-nginx-prod

# วิเคราะห์ access logs
tail -f /var/log/nginx/access.log | grep -E "(4[0-9]{2}|5[0-9]{2})"

# ดู top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

## 🔄 Alternative Reverse Proxy Options

### 1. Traefik (Docker-native)

```yaml
# docker-compose.traefik.yml
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=your@email.com
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./acme.json:/acme.json
    labels:
      - "traefik.http.routers.api.rule=Host(\`traefik.yourdomain.com\`)"

  backend:
    # ... existing config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`yourdomain.com\`) && PathPrefix(\`/api\`)"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  frontend:
    # ... existing config  
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`yourdomain.com\`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### 2. Caddy (Simple config)

```caddyfile
# Caddyfile
yourdomain.com {
    reverse_proxy /api/* backend:8080
    reverse_proxy /* frontend:3000
    
    # Auto HTTPS
    tls your@email.com
    
    # Rate limiting
    rate_limit {
        zone api {
            key {remote_host}
            events 10
            window 1s
        }
    }
}
```

### 3. HAProxy (High performance)

```haproxy
# haproxy.cfg
global
    daemon
    
defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend web_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/yourdomain.pem
    
    # Redirect HTTP to HTTPS
    redirect scheme https if !{ ssl_fc }
    
    # Route to backends
    acl is_api path_beg /api/
    use_backend api_backend if is_api
    default_backend web_backend

backend api_backend
    balance roundrobin
    server api1 backend:8080 check

backend web_backend
    balance roundrobin
    server web1 frontend:3000 check
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# ตรวจสอบ certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# ทดสอบ SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### 2. Proxy Connection Failed
```bash
# ตรวจสอบ upstream servers
docker exec sch-kpru-nginx-prod nginx -t
docker logs sch-kpru-backend-prod
docker logs sch-kpru-frontend-prod
```

#### 3. CORS Issues
```bash
# ทดสอบ CORS headers
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://yourdomain.com/api/
```

### Debug Commands

```bash
# Nginx configuration test
docker exec sch-kpru-nginx-prod nginx -t

# Reload nginx config
docker exec sch-kpru-nginx-prod nginx -s reload

# Check nginx status
docker exec sch-kpru-nginx-prod nginx -s status

# Monitor nginx access logs
docker exec sch-kpru-nginx-prod tail -f /var/log/nginx/access.log
```

## 📈 Performance Tuning

### 1. Worker Processes

```nginx
# ตั้งค่าตาม CPU cores
worker_processes auto;
worker_connections 1024;
```

### 2. Buffer Sizes

```nginx
# ปรับตาม RAM และ traffic
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
```

### 3. Keep-Alive

```nginx
# เพิ่ม performance
keepalive_timeout 65;
keepalive_requests 100;
```

## 🎯 Best Practices

1. **Always use HTTPS** in production
2. **Set up proper monitoring** (logs, metrics)
3. **Regular security updates** (nginx, certificates)
4. **Test configuration** before applying
5. **Have rollback plan** (backup configs)
6. **Monitor performance** (response times, error rates)
7. **Use CDN** for static assets (optional)
8. **Regular log rotation** to prevent disk full

## 📞 Quick Reference

```bash
# Apply new nginx config
docker exec sch-kpru-nginx-prod nginx -s reload

# Check if config is valid
docker exec sch-kpru-nginx-prod nginx -t

# View current connections
docker exec sch-kpru-nginx-prod ss -tulpn

# Monitor in real-time
docker logs -f sch-kpru-nginx-prod
```