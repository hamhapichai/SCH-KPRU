# 🌐 Cloudflare DNS Configuration for SCH-KPRU

## 📊 Current DNS Analysis

**Current Issues:**
- ❌ A records point to wrong IPs (13.248.243.5, 76.223.105.230)
- ❌ No subdomain for sch-kpru.blurger.dev
- ⚠️ Cloudflare Proxy is enabled (may need to disable initially)

**Target Domain:** `sch-kpru.blurger.dev`
**VPS IP:** `43.249.33.71`

## ✅ Required DNS Changes in Cloudflare

### 1. Add/Update A Records

```dns
# Main application
sch-kpru.blurger.dev        A    43.249.33.71    🟠 Proxied: OFF (initially)
www.sch-kpru.blurger.dev    A    43.249.33.71    🟠 Proxied: OFF (initially)

# n8n subdomain (optional)
n8n.sch-kpru.blurger.dev    A    43.249.33.71    🟠 Proxied: OFF (initially)
```

### 2. Cloudflare Dashboard Steps

#### Step 1: Navigate to DNS Settings
1. Go to Cloudflare Dashboard
2. Select domain: `blurger.dev`
3. Click on "DNS" → "Records"

#### Step 2: Add New A Records
```
Type: A
Name: sch-kpru
Content: 43.249.33.71
Proxy status: DNS only (🟠)
TTL: Auto
```

```
Type: A
Name: www.sch-kpru
Content: 43.249.33.71
Proxy status: DNS only (🟠)
TTL: Auto
```

```
Type: A (Optional for n8n)
Name: n8n.sch-kpru
Content: 43.249.33.71
Proxy status: DNS only (🟠)
TTL: Auto
```

#### Step 3: Update SSL/TLS Settings
1. Go to "SSL/TLS" → "Overview"
2. Set to "Full (strict)" mode
3. Go to "SSL/TLS" → "Origin Server"
4. Create Origin Certificate for `*.sch-kpru.blurger.dev`

## 🔄 Why Disable Cloudflare Proxy Initially?

### During Setup Phase:
- ✅ Easier SSL certificate setup (Let's Encrypt or Cloudflare Origin)
- ✅ Direct access for debugging
- ✅ Avoid Cloudflare caching during development

### After Deployment Success:
- ✅ Enable proxy for DDoS protection
- ✅ Enable Cloudflare caching
- ✅ Use Cloudflare security features

## 🛠️ Updated Configuration Files

### Environment Variables (.env.prod):
```bash
# URLs
FRONTEND_URL=https://sch-kpru.blurger.dev
NEXT_PUBLIC_API_URL=https://sch-kpru.blurger.dev/api

# N8n (if using subdomain)
N8N_BASE_URL=https://n8n.sch-kpru.blurger.dev
N8N_WEBHOOK_URL=https://n8n.sch-kpru.blurger.dev/webhook/complaints
```

### GitHub Secrets:
```bash
SERVER_HOST=43.249.33.71
SERVER_USER=root
PROJECT_PATH=/home/sch-kpru
PRODUCTION_URL=https://sch-kpru.blurger.dev
NEXT_PUBLIC_API_URL=https://sch-kpru.blurger.dev/api
```

### Nginx Configuration:
Already updated to use `sch-kpru.blurger.dev`

## 🔐 SSL Certificate Options

### Option 1: Cloudflare Origin Certificate (Recommended)

1. **Cloudflare Dashboard** → SSL/TLS → Origin Server
2. **Create Certificate** for:
   - `sch-kpru.blurger.dev`
   - `*.sch-kpru.blurger.dev` (wildcard for subdomains)
3. **Download** certificate and private key
4. **Upload to VPS:**

```bash
# On VPS
mkdir -p /home/sch-kpru/nginx/ssl
nano /home/sch-kpru/nginx/ssl/cert.pem    # Paste certificate
nano /home/sch-kpru/nginx/ssl/key.pem     # Paste private key
chmod 600 /home/sch-kpru/nginx/ssl/*
```

### Option 2: Let's Encrypt

```bash
# On VPS (after DNS propagation)
certbot certonly --standalone \
  -d sch-kpru.blurger.dev \
  -d www.sch-kpru.blurger.dev \
  -d n8n.sch-kpru.blurger.dev

# Copy certificates
cp /etc/letsencrypt/live/sch-kpru.blurger.dev/fullchain.pem /home/sch-kpru/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/sch-kpru.blurger.dev/privkey.pem /home/sch-kpru/nginx/ssl/key.pem
```

## 🧪 Testing DNS Propagation

### Check DNS Resolution:
```bash
# Test from your local machine
nslookup sch-kpru.blurger.dev
dig sch-kpru.blurger.dev

# Should return: 43.249.33.71
```

### Online Tools:
- https://www.whatsmydns.net/#A/sch-kpru.blurger.dev
- https://dnschecker.org/

## 🚀 Deployment Sequence

### 1. Update Cloudflare DNS (5-10 minutes)
- Add A records as shown above
- Wait for DNS propagation

### 2. Generate SSL Certificate (5 minutes)
- Use Cloudflare Origin Certificate

### 3. Run VPS Setup (15 minutes)
```bash
ssh root@43.249.33.71
curl -sSL https://raw.githubusercontent.com/hamhapichai/SCH-KPRU/develop/vps-setup.sh | bash
```

### 4. Configure GitHub Secrets (2 minutes)
- Update with sch-kpru.blurger.dev URLs

### 5. Deploy Application (10 minutes)
```bash
git push origin main
```

### 6. Test Access
```bash
curl https://sch-kpru.blurger.dev/health
curl https://sch-kpru.blurger.dev/api/health
```

## 🎯 Expected URLs After Deployment

### SCH-KPRU Application:
- **Main**: https://sch-kpru.blurger.dev
- **API**: https://sch-kpru.blurger.dev/api
- **Swagger**: https://sch-kpru.blurger.dev/swagger
- **Health**: https://sch-kpru.blurger.dev/health

### n8n Access:
- **Current**: http://43.249.33.71:5678
- **Secure**: https://n8n.sch-kpru.blurger.dev (after setup)

## 🔧 n8n Setup After Deployment

### Connect to Shared Network:
```bash
# Find n8n container
docker ps | grep n8n

# Connect to network
docker network connect sch-kpru-network <n8n_container_name>
```

### Access n8n:
1. **Initial setup**: http://43.249.33.71:5678
2. **Create admin account** in n8n
3. **Configure workflows**
4. **Test webhooks** with SCH-KPRU

## 📋 Pre-deployment Checklist

- [ ] Update Cloudflare DNS records
- [ ] Wait for DNS propagation (5-10 minutes)
- [ ] Generate SSL certificate
- [ ] Update GitHub Secrets with real domain
- [ ] Verify VPS can be accessed via SSH
- [ ] Confirm n8n container is running

## ⚠️ Important Notes

1. **DNS Propagation**: May take 5-24 hours globally
2. **Cloudflare Proxy**: Keep disabled until after first successful deployment
3. **SSL Certificate**: Use Cloudflare Origin cert for easier setup
4. **n8n Access**: Will be accessible immediately via IP, setup can be done after SCH-KPRU deployment

Ready to start with updating the Cloudflare DNS? 🚀