# 🚀 GitHub Actions CI/CD Setup Guide

## 📋 Overview

โปรเจกต์ SCH-KPRU ได้ตั้งค่า GitHub Actions CI/CD pipeline แล้ว ประกอบด้วย:

- **CI Pipeline** (`ci.yml`) - การทำ Continuous Integration
- **CD Pipeline** (`cd.yml`) - การทำ Continuous Deployment
- **Development Workflow** (`dev.yml`) - สำหรับ development branches

## 🔧 Setup Requirements

### 1. GitHub Repository Settings

#### GitHub Container Registry (GHCR)
1. ไปที่ GitHub Repository → Settings → Actions → General
2. เลือก "Read and write permissions" สำหรับ GITHUB_TOKEN
3. เปิดใช้ "Allow GitHub Actions to create and approve pull requests"

#### Package Settings
1. ไปที่ GitHub Repository → Packages
2. เมื่อมี packages แล้ว ให้เปิดใช้ public visibility (หรือให้ team เข้าถึงได้)

### 2. GitHub Secrets Configuration

ไปที่ Repository → Settings → Secrets and variables → Actions

#### Required Secrets:

```bash
# Production Server Access
SSH_PRIVATE_KEY=<your-server-ssh-private-key>
SERVER_HOST=<your-server-ip-or-domain>
SERVER_USER=<your-server-username>
PROJECT_PATH=<path-to-project-on-server>  # เช่น /home/user/SCH-KPRU

# Application URLs
PRODUCTION_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database & Security (จะใช้ในการ deploy)
POSTGRES_PASSWORD=<your-production-db-password>
JWT_SECRET=<your-jwt-secret>

# Optional: Staging Environment
STAGING_SSH_PRIVATE_KEY=<staging-server-ssh-key>
STAGING_SERVER_HOST=<staging-server-ip>
STAGING_SERVER_USER=<staging-server-username>
STAGING_PROJECT_PATH=<staging-project-path>
STAGING_URL=https://staging.yourdomain.com
```

### 3. Server Preparation

#### SSH Key Setup
```bash
# บนเครื่อง local ของคุณ
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com"

# Copy public key ไปยัง server
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server.com

# Copy private key ไป GitHub Secrets (SSH_PRIVATE_KEY)
cat ~/.ssh/id_rsa
```

#### Server Directory Setup
```bash
# บน production server
mkdir -p /home/user/SCH-KPRU
cd /home/user/SCH-KPRU

# Clone repository
git clone https://github.com/hamhapichai/SCH-KPRU.git .

# Setup environment
cp .env.prod.example .env.prod
# แก้ไข .env.prod ตามต้องการ

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

## 🔄 Workflow Triggers

### CI Pipeline (`ci.yml`)
- **Triggers**: Push และ PR ไปที่ `main`, `develop` branches
- **ทำงาน**: 
  - Test backend และ frontend
  - Security scanning
  - Build Docker images และ push ไป GHCR

### CD Pipeline (`cd.yml`)
- **Triggers**: Push ไปที่ `main` branch หรือ manual dispatch
- **ทำงาน**:
  - Deploy ไป production server
  - Run database migrations
  - Create database backup
  - Health check

### Development Workflow (`dev.yml`)
- **Triggers**: Push ไปที่ `develop`, `feature/**`, `hotfix/**`
- **ทำงาน**:
  - Code quality checks
  - Unit tests และ integration tests
  - Deploy ไป staging (สำหรับ develop branch)

## 📦 Docker Image Management

### Image Tags
- `latest` - สำหรับ main branch
- `develop` - สำหรับ develop branch
- `<branch-name>` - สำหรับ feature branches
- `<branch>-<sha>` - Unique identifier

### Manual Image Build
```bash
# Build และ push โดยไม่ผ่าน CI/CD
docker build -t ghcr.io/hamhapichai/sch-kpru/backend:manual ./backend/SchKpruApi
docker build -t ghcr.io/hamhapichai/sch-kpru/frontend:manual ./frontend

docker push ghcr.io/hamhapichai/sch-kpru/backend:manual
docker push ghcr.io/hamhapichai/sch-kpru/frontend:manual
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)
1. Push code ไปที่ `main` branch
2. CI pipeline จะ run โดยอัตโนมัติ
3. หาก CI ผ่าน, CD pipeline จะ deploy ไป production
4. ระบบจะ health check และแจ้งผลลัพธ์

### Manual Deployment
```bash
# บน GitHub Repository
# Actions → CD Pipeline → Run workflow
# เลือก environment และ run
```

### Emergency Deployment
```bash
# บน production server
cd /home/user/SCH-KPRU

# Pull latest images
docker pull ghcr.io/hamhapichai/sch-kpru/backend:latest
docker pull ghcr.io/hamhapichai/sch-kpru/frontend:latest

# Update services
export BACKEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/backend:latest
export FRONTEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/frontend:latest
docker-compose -f docker-compose.registry.yml up -d
```

## 🔍 Monitoring & Debugging

### Check Workflow Status
- ไปที่ GitHub Repository → Actions
- ดู status ของแต่ละ workflow run
- Click เข้าไปดู logs ของแต่ละ step

### Server Logs
```bash
# บน production server
cd /home/user/SCH-KPRU

# ดู logs ของ services
docker-compose -f docker-compose.registry.yml logs -f

# ดู logs แยกตาม service
docker logs sch-kpru-backend-prod
docker logs sch-kpru-frontend-prod
docker logs sch-kpru-nginx-prod
```

### Health Checks
```bash
# ตรวจสอบ application health
curl https://yourdomain.com/health

# ตรวจสอบ API health
curl https://yourdomain.com/api/health
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
- ตรวจสอบ SSH_PRIVATE_KEY ใน GitHub Secrets
- ตรวจสอบ SERVER_HOST และ SERVER_USER
- ทดสอบ SSH connection manually

#### 2. Docker Image Pull Failed
- ตรวจสอบ GitHub Container Registry permissions
- ตรวจสอบ GITHUB_TOKEN permissions
- ลอง login ใหม่: `docker login ghcr.io`

#### 3. Service Startup Failed
- ดู logs: `docker-compose logs`
- ตรวจสอบ environment variables
- ตรวจสอบ database connection

#### 4. Health Check Failed
- ตรวจสอบ firewall settings
- ตรวจสอบ nginx configuration
- ตรวจสอบ SSL certificates

### Debug Commands
```bash
# ตรวจสอบ container status
docker ps -a

# ตรวจสอบ network connectivity
docker exec sch-kpru-backend-prod curl -f http://localhost:8080/health

# ตรวจสอบ environment variables
docker exec sch-kpru-backend-prod env | grep -E "(POSTGRES|JWT|API)"

# Restart specific service
docker-compose -f docker-compose.registry.yml restart backend
```

## 📊 Best Practices

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development integration
- `feature/*` - Feature development
- `hotfix/*` - Production hotfixes

### Environment Management
- ใช้ `.env.prod` สำหรับ production
- ใช้ `.env.staging` สำหรับ staging
- ไม่ commit sensitive data ใน git

### Security
- Rotate SSH keys เป็นประจำ
- Update dependencies เป็นประจำ
- Monitor security vulnerabilities
- Use strong passwords และ JWT secrets

### Performance
- Monitor container resource usage
- Set up log rotation
- Clean up old Docker images เป็นประจำ
- Monitor application performance

## 📞 Support

หากมีปัญหาเกี่ยวกับ CI/CD pipeline:

1. ตรวจสอบ GitHub Actions logs
2. ตรวจสอบ server logs
3. ทดสอบ manual deployment
4. ตรวจสอบ network connectivity
5. ปรึกษา production-deploy-guide.md สำหรับ manual setup