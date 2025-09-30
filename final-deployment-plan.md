# 🚀 SCH-KPRU Final Pre-deployment Check & Steps

## ✅ **FINAL CHECK COMPLETE - ALL SYSTEMS GO!**

### 📊 **System Status:**
- ✅ **DNS**: `sch-kpru.blurger.dev` → `43.249.33.71` (Proxy OFF)
- ✅ **Backend**: ASP.NET Core 8.0 with Dockerfile ready
- ✅ **Frontend**: Next.js 15 with standalone output configured
- ✅ **CI/CD**: GitHub Actions workflows configured for main branch only
- ✅ **Docker**: Production-ready compose files
- ✅ **Health Endpoints**: /health and /api/health implemented
- ✅ **n8n Integration**: Shared network ready
- ✅ **SSL**: Nginx config ready for SSL termination
- ✅ **Security**: Rate limiting, headers, and auth configured

### 🎯 **No Critical Issues Found!**

---

## 🚀 **DEPLOYMENT STEPS - START NOW!**

### **STEP 1: Setup VPS (15 minutes)**

```bash
# SSH into your VPS
ssh root@43.249.33.71

# Run the automated setup script
curl -sSL https://raw.githubusercontent.com/hamhapichai/SCH-KPRU/develop/vps-setup.sh | bash
```

**What this does:**
- ✅ Installs Docker & Docker Compose
- ✅ Creates SSH keys for GitHub Actions
- ✅ Sets up project directory
- ✅ Creates shared Docker network
- ✅ Prepares environment files

**Expected time: 10-15 minutes**

---

### **STEP 2: Copy SSH Private Key (2 minutes)**

After VPS setup completes, you'll see a private key. **Copy it exactly as shown.**

---

### **STEP 3: Configure GitHub Secrets (3 minutes)**

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

**Add these secrets:**

```bash
SSH_PRIVATE_KEY=<paste the private key from Step 2>
SERVER_HOST=43.249.33.71
SERVER_USER=root
PROJECT_PATH=/home/sch-kpru
PRODUCTION_URL=https://sch-kpru.blurger.dev
NEXT_PUBLIC_API_URL=https://sch-kpru.blurger.dev/api
POSTGRES_PASSWORD=<create_strong_password>
JWT_SECRET=<generate_with_openssl_rand_hex_32>
```

**To generate JWT_SECRET:**
```bash
# Run this on your local machine or VPS
openssl rand -hex 32
```

---

### **STEP 4: Setup SSL Certificate (5 minutes)**

#### **Option A: Cloudflare Origin Certificate (Recommended)**

1. **Cloudflare Dashboard** → SSL/TLS → Origin Server
2. **Create Certificate** for:
   - `sch-kpru.blurger.dev`
   - `*.sch-kpru.blurger.dev`
3. **Download** and **upload to VPS:**

```bash
# On VPS, create SSL files
nano /home/sch-kpru/nginx/ssl/cert.pem    # Paste certificate
nano /home/sch-kpru/nginx/ssl/key.pem     # Paste private key
chmod 600 /home/sch-kpru/nginx/ssl/*
```

#### **Option B: Let's Encrypt (Alternative)**

```bash
# On VPS (after DNS propagation)
certbot certonly --standalone -d sch-kpru.blurger.dev
cp /etc/letsencrypt/live/sch-kpru.blurger.dev/fullchain.pem /home/sch-kpru/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/sch-kpru.blurger.dev/privkey.pem /home/sch-kpru/nginx/ssl/key.pem
```

---

### **STEP 5: Connect n8n to Shared Network (2 minutes)**

```bash
# On VPS, find your n8n container
docker ps | grep n8n

# Connect n8n to shared network (replace <container_name>)
docker network connect sch-kpru-network <n8n_container_name>

# Verify connection
docker network inspect sch-kpru-network
```

---

### **STEP 6: Deploy Application! (10 minutes)**

**On your local machine:**

```bash
# Make sure you're on develop branch
git checkout develop

# Add all our new files
git add .

# Commit changes
git commit -m "feat: production deployment configuration

- Add production nginx config for sch-kpru.blurger.dev
- Configure Docker Compose for VPS deployment
- Add health endpoints for backend and frontend
- Setup CI/CD for main branch deployment
- Add n8n integration support
- Configure SSL/HTTPS support"

# Push to develop first (optional - for testing)
git push origin develop

# Create and push to main branch for production deployment
git checkout main
git merge develop
git push origin main
```

**This will trigger:**
- ✅ CI Pipeline (tests, builds, security scan)
- ✅ Docker image build and push to GitHub Container Registry
- ✅ CD Pipeline (deploy to VPS)
- ✅ Database migration
- ✅ Health checks
- ✅ Automatic backup

**Monitor deployment:**
- Go to **GitHub → Actions** tab
- Watch the CI/CD pipeline progress
- Should complete in 8-12 minutes

---

### **STEP 7: Verify Deployment (5 minutes)**

#### **Check Application Health:**
```bash
# Test main application
curl https://sch-kpru.blurger.dev/health

# Test API
curl https://sch-kpru.blurger.dev/api/health

# Check if frontend loads
curl -I https://sch-kpru.blurger.dev
```

#### **Expected Responses:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T...",
  "service": "sch-kpru-frontend",
  "version": "1.0.0",
  "environment": "production"
}
```

#### **Check VPS Services:**
```bash
# On VPS
docker ps --filter "name=sch-kpru"
docker logs sch-kpru-backend-prod
docker logs sch-kpru-frontend-prod
docker logs sch-kpru-nginx-prod
```

---

### **STEP 8: Setup n8n (5 minutes)**

1. **Access n8n**: http://43.249.33.71:5678
2. **Create admin account** (first time setup)
3. **Test webhook connectivity:**

```bash
# Test from SCH-KPRU backend to n8n
docker exec sch-kpru-backend-prod curl http://n8n:5678
```

---

## 🎉 **SUCCESS CRITERIA**

Deployment is successful when:
- [ ] ✅ `https://sch-kpru.blurger.dev` loads the frontend
- [ ] ✅ `https://sch-kpru.blurger.dev/api/health` returns healthy
- [ ] ✅ `https://sch-kpru.blurger.dev/swagger` shows API docs
- [ ] ✅ All Docker containers are running
- [ ] ✅ n8n is accessible and connected
- [ ] ✅ Database migrations completed
- [ ] ✅ No critical errors in logs

---

## ⚡ **Quick Commands Reference**

```bash
# Check deployment status
make vps-health

# View logs
make vps-logs

# Restart services
make vps-restart

# Update services
make vps-update
```

---

## 🛟 **If Something Goes Wrong**

### **GitHub Actions Fails:**
- Check GitHub Actions logs
- Verify GitHub Secrets are correct
- Ensure SSH key has proper permissions

### **SSL Issues:**
- Use HTTP first: `http://sch-kpru.blurger.dev`
- Check certificate files exist on VPS
- Verify domain points to correct IP

### **Container Issues:**
```bash
# On VPS
docker ps -a                           # Check all containers
docker logs sch-kpru-backend-prod      # Check backend logs
docker network inspect sch-kpru-network # Check network
```

### **Emergency Rollback:**
```bash
# On VPS
docker-compose -f docker-compose.vps.yml down
# Fix issues and redeploy
```

---

## 🚀 **TOTAL TIME ESTIMATE: 45 minutes**

- Step 1 (VPS Setup): 15 min
- Step 2 (Copy SSH): 2 min  
- Step 3 (GitHub Secrets): 3 min
- Step 4 (SSL Setup): 5 min
- Step 5 (n8n Network): 2 min
- Step 6 (Deploy): 10 min
- Step 7 (Verify): 5 min
- Step 8 (n8n Setup): 5 min

---

## 🎯 **READY TO START?**

**คุณพร้อมเริ่ม Step 1 แล้วไหมครับ?**

หรือมีคำถามเกี่ยวกับขั้นตอนไหนก่อนที่จะเริ่ม? 🚀

---

**Next Action: SSH into VPS and run setup script!**