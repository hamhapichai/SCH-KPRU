# 🚀 VPS Setup for GitHub Actions CI/CD

## 📊 Current VPS Status
- **IP**: 43.249.33.71
- **DNS**: Cloudflare
- **n8n**: Running in Docker
- **Target**: Deploy SCH-KPRU via GitHub Actions

## 🔧 VPS Preparation (One-time setup)

### 1. Connect to your VPS
```bash
ssh root@43.249.33.71
# หรือ ssh user@43.249.33.71 (ถ้าไม่ใช่ root)
```

### 2. Install Required Software
```bash
# Update system
apt update && apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Make and Git
apt install make git -y

# Add user to docker group (if using non-root user)
usermod -aG docker $USER
```

### 3. Setup SSH Key for GitHub Actions
```bash
# Create SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Show private key (copy this to GitHub Secrets)
echo "=== COPY THIS PRIVATE KEY TO GITHUB SECRETS ==="
cat ~/.ssh/github_actions
echo "=== END OF PRIVATE KEY ==="
```

### 4. Create Project Directory
```bash
# Create directory for the project
mkdir -p /home/sch-kpru
cd /home/sch-kpru

# Clone repository
git clone https://github.com/hamhapichai/SCH-KPRU.git .

# Set proper permissions
chown -R $USER:$USER /home/sch-kpru
```

### 5. Setup Environment Files
```bash
# Copy environment template
cp .env.prod.example .env.prod

# Edit environment file
nano .env.prod
```

**Environment Configuration:**
```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=sch_kpru_prod
POSTGRES_USER=sch_kpru_user

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your_generated_jwt_secret_here
JWT_ISSUER=SCH-KPRU
JWT_AUDIENCE=SCH-KPRU-Users

# URLs (replace with your domain)
FRONTEND_URL=https://sch-kpru.blurger.dev
NEXT_PUBLIC_API_URL=https://sch-kpru.blurger.dev/api

# N8n Integration (your existing n8n)
N8N_BASE_URL=http://43.249.33.71:5678
N8N_WEBHOOK_URL=http://43.249.33.71:5678/webhook/complaints

# Optional: OpenAI (if using AI features)
OPENAI_API_KEY=your_openai_key_here
```

### 6. Setup Cloudflare DNS
```dns
# A Records in Cloudflare Dashboard
yourdomain.com     A    43.249.33.71
www.yourdomain.com A    43.249.33.71

# Optional subdomains
api.yourdomain.com A    43.249.33.71
n8n.yourdomain.com A    43.249.33.71
```

### 7. Setup Firewall
```bash
# Install and configure UFW
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 5678    # n8n (if you want external access)
ufw enable
```

### 8. Login to GitHub Container Registry
```bash
# Login to GHCR (you'll need GitHub token)
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u hamhapichai --password-stdin
```

## 🔐 GitHub Repository Setup

### 1. Go to GitHub Repository Settings
**Repository → Settings → Secrets and variables → Actions**

### 2. Add Repository Secrets
```bash
# Server Access
SSH_PRIVATE_KEY=<paste the private key from step 3>
SERVER_HOST=43.249.33.71
SERVER_USER=root  # or your username
PROJECT_PATH=/home/sch-kpru

# Application URLs  
PRODUCTION_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database & Security
POSTGRES_PASSWORD=<your_secure_password>
JWT_SECRET=<your_jwt_secret>

# Optional: Staging Environment
STAGING_SSH_PRIVATE_KEY=<same as SSH_PRIVATE_KEY or different>
STAGING_SERVER_HOST=43.249.33.71
STAGING_SERVER_USER=root
STAGING_PROJECT_PATH=/home/sch-kpru-staging
STAGING_URL=https://staging.yourdomain.com
```

### 3. Enable GitHub Container Registry
**Repository → Settings → Actions → General**
- Set "Workflow permissions" to "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

## 🚀 Deployment Process

### Option 1: Automatic Deployment (Recommended)

1. **Push to develop branch** → Deploys to staging
2. **Create PR to main** → Review code
3. **Merge to main** → Deploys to production automatically

```bash
# On your local machine
git add .
git commit -m "feat: add new feature"
git push origin develop  # Triggers staging deployment

# After testing staging, create PR to main
# Merge PR → triggers production deployment
```

### Option 2: Manual Deployment

```bash
# Go to GitHub Repository → Actions
# Select "CD Pipeline" → "Run workflow"
# Choose environment and deploy
```

## 🐳 Docker Network Configuration

Since you have n8n running, create a shared network:

```bash
# On your VPS, create shared network
docker network create sch-kpru-network

# Connect existing n8n to the network
docker network connect sch-kpru-network <n8n_container_name>

# Check existing containers
docker ps
```

Update your n8n to use the shared network in `docker-compose.yml`:

```yaml
# Add to your existing n8n docker-compose
networks:
  default:
    external:
      name: sch-kpru-network
```

## 🔧 Update Docker Compose for VPS

Create `docker-compose.vps.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sch-kpru-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-sch_kpru_prod}
      POSTGRES_USER: ${POSTGRES_USER:-sch_kpru_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    networks:
      - sch-kpru-network

  backend:
    image: ${BACKEND_IMAGE:-ghcr.io/hamhapichai/sch-kpru/backend:latest}
    container_name: sch-kpru-backend-prod
    restart: unless-stopped
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:8080
      ConnectionStrings__DefaultConnection: Host=postgres;Port=5432;Database=${POSTGRES_DB:-sch_kpru_prod};Username=${POSTGRES_USER:-sch_kpru_user};Password=${POSTGRES_PASSWORD}
      Jwt__Key: ${JWT_SECRET}
      Jwt__Issuer: ${JWT_ISSUER:-SCH-KPRU}
      Jwt__Audience: ${JWT_AUDIENCE:-SCH-KPRU-Users}
      # N8n integration (connect to your existing n8n)
      WebhookOptions__N8nBaseUrl: http://n8n:5678
      WebhookOptions__AISuggestionCallbackUrl: /webhook/complaints/ai-suggestion
    depends_on:
      - postgres
    networks:
      - sch-kpru-network

  frontend:
    image: ${FRONTEND_IMAGE:-ghcr.io/hamhapichai/sch-kpru/frontend:latest}
    container_name: sch-kpru-frontend-prod
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_APP_ENV: production
    networks:
      - sch-kpru-network

  nginx:
    image: nginx:alpine
    container_name: sch-kpru-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - sch-kpru-network

networks:
  sch-kpru-network:
    external: true

volumes:
  postgres_data:
  nginx_logs:
```

## 🔒 SSL Certificate Setup

### Option 1: Cloudflare SSL (Recommended)
1. **Cloudflare Dashboard** → SSL/TLS → Origin Server
2. **Create Certificate** → Download cert and key
3. **Upload to VPS**:
```bash
# Create SSL directory
mkdir -p /home/sch-kpru/nginx/ssl

# Upload certificate files (use SCP or nano)
nano /home/sch-kpru/nginx/ssl/cert.pem  # Paste certificate
nano /home/sch-kpru/nginx/ssl/key.pem   # Paste private key
```

### Option 2: Let's Encrypt
```bash
# Install certbot
apt install certbot -y

# Generate certificate (stop nginx first)
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to project
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/sch-kpru/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/sch-kpru/nginx/ssl/key.pem
```

## 🎯 First Deployment Test

### 1. Manual Test on VPS
```bash
cd /home/sch-kpru

# Test with registry images
export BACKEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/backend:latest
export FRONTEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/frontend:latest

docker-compose -f docker-compose.vps.yml up -d

# Check status
docker ps
curl http://localhost/health
```

### 2. Test GitHub Actions
```bash
# On your local machine
git add .
git commit -m "feat: initial vps setup"
git push origin develop

# Check GitHub Actions tab for deployment status
```

## ⚡ Quick Commands for VPS Management

```bash
# Check all containers
docker ps -a

# View logs
docker logs sch-kpru-backend-prod
docker logs sch-kpru-frontend-prod
docker logs sch-kpru-nginx-prod

# Restart services
docker-compose -f docker-compose.vps.yml restart

# Update from registry
docker pull ghcr.io/hamhapichai/sch-kpru/backend:latest
docker pull ghcr.io/hamhapichai/sch-kpru/frontend:latest
docker-compose -f docker-compose.vps.yml up -d

# Health check
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

## 🔍 Monitoring & Troubleshooting

### Check Service Status
```bash
# System resources
docker stats

# Network connectivity
docker network ls
docker network inspect sch-kpru-network

# Nginx status
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/health
```

### Common Issues

1. **Port conflicts with n8n**: Use different ports or shared network
2. **SSL certificate**: Use Cloudflare SSL for easier setup
3. **GitHub Actions fails**: Check SSH key and server permissions
4. **Database connection**: Ensure PostgreSQL container is healthy

## 📋 Checklist

- [ ] VPS has Docker and Docker Compose
- [ ] SSH key generated and added to GitHub Secrets
- [ ] Project directory created: `/home/sch-kpru`
- [ ] Environment file configured: `.env.prod`
- [ ] Cloudflare DNS pointed to VPS IP
- [ ] SSL certificates configured
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] GitHub Secrets configured
- [ ] Shared Docker network created
- [ ] First deployment tested

## 🚀 Next Steps

1. **Test staging deployment** by pushing to `develop` branch
2. **Configure domain in nginx.conf** with your actual domain
3. **Test production deployment** by merging to `main` branch
4. **Set up monitoring** and log collection
5. **Configure n8n workflows** to connect with your application