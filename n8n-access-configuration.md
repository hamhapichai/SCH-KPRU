# 🔧 n8n Security & Access Configuration

## 🌐 Current n8n Access
- **Current URL**: http://43.249.33.71:5678
- **Status**: Accessible but not secure

## 🛡️ Recommended Security Improvements

### Option 1: Reverse Proxy through Nginx (Recommended)

Add n8n to the same nginx configuration:

```nginx
# Add to nginx/nginx-production.conf

# n8n subdomain
server {
    listen 443 ssl http2;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Basic authentication (optional but recommended)
    auth_basic "n8n Admin Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://n8n:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for n8n
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

### Option 2: VPN Access Only

Restrict n8n to internal network access only:

```bash
# Update firewall to block external access to port 5678
sudo ufw delete allow 5678
sudo ufw allow from 192.168.0.0/16 to any port 5678  # Internal network only
```

### Option 3: IP Whitelist

Allow only specific IPs to access n8n:

```bash
# Allow only your office/home IP
sudo ufw allow from YOUR_IP_ADDRESS to any port 5678
```

## 🔐 Setup Basic Authentication for n8n

### Create password file:
```bash
# Install apache2-utils for htpasswd
sudo apt install apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd admin
# Enter password when prompted

# Set proper permissions
sudo chown www-data:www-data /etc/nginx/.htpasswd
sudo chmod 640 /etc/nginx/.htpasswd
```

## 🌍 DNS Configuration for n8n Subdomain

Add to Cloudflare DNS:
```dns
n8n.yourdomain.com    A    43.249.33.71
```

## 🔄 Update n8n Docker Configuration

### If using docker-compose for n8n, update it:

```yaml
# n8n-docker-compose.yml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"  # Remove this line if using nginx proxy
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - GENERIC_TIMEZONE=Asia/Bangkok
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - sch-kpru-network  # Connect to shared network

volumes:
  n8n_data:

networks:
  sch-kpru-network:
    external: true
```

## 🚀 Post-deployment Access URLs

After implementing the above:

### SCH-KPRU Application:
- **Main App**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Admin Panel**: https://yourdomain.com/admin (if applicable)

### n8n Workflow Automation:
- **Secure Access**: https://n8n.yourdomain.com (with SSL + auth)
- **Direct Access**: http://43.249.33.71:5678 (less secure)

## 🔗 Integration Between SCH-KPRU and n8n

### Webhook URLs for SCH-KPRU to call n8n:
```bash
# Internal Docker network (recommended)
http://n8n:5678/webhook/complaints/ai-suggestion

# External URL (if needed)
https://n8n.yourdomain.com/webhook/complaints/ai-suggestion
```

### Environment Variables in SCH-KPRU:
```bash
# In .env.prod
N8N_BASE_URL=http://n8n:5678  # Internal Docker network
# or
N8N_BASE_URL=https://n8n.yourdomain.com  # External URL

N8N_WEBHOOK_URL=${N8N_BASE_URL}/webhook/complaints
```

## 🧪 Testing Access

### Test SCH-KPRU:
```bash
# Health check
curl https://yourdomain.com/health

# API test
curl https://yourdomain.com/api/health

# Frontend test
curl -I https://yourdomain.com
```

### Test n8n:
```bash
# Direct access
curl http://43.249.33.71:5678

# Secure access (after setup)
curl https://n8n.yourdomain.com
```

### Test Integration:
```bash
# From SCH-KPRU container
docker exec sch-kpru-backend-prod curl http://n8n:5678
```

## 📋 Quick Setup Checklist

- [ ] SCH-KPRU deployed and accessible
- [ ] n8n accessible on port 5678
- [ ] Both containers on same Docker network
- [ ] (Optional) Setup n8n subdomain in DNS
- [ ] (Optional) Configure nginx proxy for n8n
- [ ] (Optional) Setup basic authentication
- [ ] (Optional) Restrict firewall access
- [ ] Test webhook integration

## 🎯 Recommended Final Configuration

For production, I recommend:

1. **SCH-KPRU**: https://yourdomain.com (public access)
2. **n8n**: https://n8n.yourdomain.com (restricted access with auth)
3. **Integration**: Internal Docker network communication
4. **Security**: Basic auth + IP restrictions for n8n

This setup provides:
- ✅ Secure public access to your main application
- ✅ Protected admin access to n8n
- ✅ Efficient internal communication
- ✅ SSL encryption for all external traffic