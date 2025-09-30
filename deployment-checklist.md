# 🚀 SCH-KPRU Production Deployment Checklist

## 📊 Pre-deployment Status Check

### ✅ สิ่งที่พร้อมแล้ว

#### GitHub Repository & CI/CD
- [x] GitHub Actions workflows configured (CI/CD)
- [x] Docker images build on main branch only
- [x] No staging deployment (main branch only)
- [x] GitHub Container Registry ready
- [x] Pull request templates
- [x] Issue templates

#### Docker Configuration
- [x] Backend Dockerfile (ASP.NET Core)
- [x] Frontend Dockerfile (Next.js with standalone output)
- [x] Production Docker Compose (docker-compose.vps.yml)
- [x] Registry-based Docker Compose (docker-compose.registry.yml)
- [x] Nginx reverse proxy configuration
- [x] Health check endpoints

#### Infrastructure Scripts
- [x] VPS setup script (vps-setup.sh)
- [x] Makefile with VPS commands
- [x] Environment file templates
- [x] SSL/HTTPS configuration

### 🔧 ต้องทำก่อน Deploy

#### 1. VPS Setup (43.249.33.71)
```bash
# SSH into VPS
ssh root@43.249.33.71

# Run setup script
curl -sSL https://raw.githubusercontent.com/hamhapichai/SCH-KPRU/develop/vps-setup.sh | bash
```

#### 2. GitHub Secrets Configuration
**Go to: Repository → Settings → Secrets and variables → Actions**

**Required Secrets:**
```bash
SSH_PRIVATE_KEY=<from VPS setup script>
SERVER_HOST=43.249.33.71
SERVER_USER=root
PROJECT_PATH=/home/sch-kpru
PRODUCTION_URL=https://sch-kpru.blurger.dev
NEXT_PUBLIC_API_URL=https://sch-kpru.blurger.dev/api
POSTGRES_PASSWORD=<secure_password>
JWT_SECRET=<generate with: openssl rand -hex 32>
```

#### 3. Domain & DNS Setup (Cloudflare)
```dns
# A Records
yourdomain.com     A    43.249.33.71
www.yourdomain.com A    43.249.33.71
```

#### 4. SSL Certificate Setup
**Option 1: Cloudflare SSL (Recommended)**
- Cloudflare Dashboard → SSL/TLS → Origin Server
- Create Certificate → Download cert and key
- Upload to `/home/sch-kpru/nginx/ssl/`

**Option 2: Let's Encrypt**
```bash
# On VPS
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

#### 5. Environment Configuration
Edit `/home/sch-kpru/.env.prod` on VPS:
```bash
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=sch_kpru_user
POSTGRES_DB=sch_kpru_prod

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here
JWT_ISSUER=SCH-KPRU
JWT_AUDIENCE=SCH-KPRU-Users

# URLs
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# N8n Integration (your existing n8n)
N8N_BASE_URL=http://n8n:5678
N8N_WEBHOOK_URL=http://n8n:5678/webhook/complaints
```

#### 6. Connect n8n to Shared Network
```bash
# On VPS
docker ps | grep n8n  # Find n8n container name
docker network connect sch-kpru-network <n8n_container_name>
```

## 🚀 Deployment Process

### Method 1: GitHub Actions (Recommended)

1. **Push to main branch**:
```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

2. **Monitor deployment**:
- Go to GitHub → Actions
- Watch CI/CD pipeline
- Check deployment status

### Method 2: Manual VPS Deployment

```bash
# On VPS
cd /home/sch-kpru

# Pull latest code
git pull origin main

# Create shared network
docker network create sch-kpru-network || true

# Connect n8n to network
docker network connect sch-kpru-network <n8n_container_name>

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u hamhapichai --password-stdin

# Deploy using registry images
export BACKEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/backend:latest
export FRONTEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/frontend:latest
docker-compose -f docker-compose.vps.yml up -d
```

## ✅ Post-deployment Verification

### 1. Health Checks
```bash
# Basic connectivity
curl -I https://yourdomain.com/health
curl -I https://yourdomain.com/api/health

# Detailed check
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

### 2. Service Status
```bash
# On VPS
docker ps --filter "name=sch-kpru"
docker-compose -f docker-compose.vps.yml ps
```

### 3. Logs Check
```bash
# Backend logs
docker logs sch-kpru-backend-prod

# Frontend logs  
docker logs sch-kpru-frontend-prod

# Nginx logs
docker logs sch-kpru-nginx-prod
```

### 4. Database Connection
```bash
# Test database connection
docker exec sch-kpru-postgres-prod pg_isready -U sch_kpru_user
```

### 5. Application Features
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Authentication works
- [ ] File uploads work (if applicable)
- [ ] n8n integration works

## 🛡️ Security Verification

- [ ] HTTPS/SSL working
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] No sensitive data in logs
- [ ] Database credentials secure
- [ ] JWT secret properly set

## 📊 Performance Check

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Database queries optimized
- [ ] Static assets cached
- [ ] Gzip compression enabled

## 🔄 Rollback Plan

If deployment fails:

### Quick Rollback
```bash
# Stop current services
docker-compose -f docker-compose.vps.yml down

# Use previous images (if available)
export BACKEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/backend:previous-tag
export FRONTEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/frontend:previous-tag
docker-compose -f docker-compose.vps.yml up -d
```

### Complete Rollback
```bash
# Restore from backup
git checkout HEAD~1
docker-compose -f docker-compose.vps.yml up -d --build
```

## 📞 Troubleshooting

### Common Issues

1. **Container startup fails**
   - Check logs: `docker logs <container_name>`
   - Check environment variables
   - Verify network connectivity

2. **Database connection error**
   - Check PostgreSQL container: `docker exec sch-kpru-postgres-prod pg_isready`
   - Verify connection string
   - Check database credentials

3. **SSL/HTTPS issues**
   - Verify certificate files exist
   - Check domain configuration
   - Test with HTTP first

4. **n8n integration not working**
   - Verify n8n is connected to shared network
   - Check n8n container status
   - Test webhook URLs

### Debug Commands
```bash
# Check all containers
docker ps -a

# Check networks
docker network ls
docker network inspect sch-kpru-network

# Check environment variables
docker exec sch-kpru-backend-prod env | grep -E "(POSTGRES|JWT|API)"

# Test internal connectivity
docker exec sch-kpru-backend-prod curl -f http://postgres:5432
docker exec sch-kpru-nginx-prod curl -f http://backend:8080/health
```

## 🎯 Success Criteria

Deployment is successful when:
- [ ] All containers are running and healthy
- [ ] Application accessible via HTTPS
- [ ] All health checks pass
- [ ] Database is accessible and migrations applied
- [ ] n8n integration working
- [ ] No critical errors in logs
- [ ] Performance meets requirements

## 📋 Final Checklist Before Going Live

- [ ] VPS properly configured with latest updates
- [ ] All GitHub Secrets set correctly
- [ ] Domain DNS pointing to VPS
- [ ] SSL certificates installed and working
- [ ] Environment variables properly set
- [ ] n8n connected to shared network
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

---

## 🚀 Ready to Deploy?

If all checkboxes above are complete, you're ready to deploy!

**Final deployment command:**
```bash
git add .
git commit -m "feat: production ready"
git push origin main
```

Then monitor the GitHub Actions deployment and verify all health checks pass.