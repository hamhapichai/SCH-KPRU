#!/bin/bash

# ===========================================
# SCH-KPRU VPS Setup Script
# ===========================================
# This script sets up the VPS for GitHub Actions deployment
# Run this script on your VPS (43.249.33.71)

set -e

echo "🚀 Starting SCH-KPRU VPS Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✅${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} ${1}"
}

print_error() {
    echo -e "${RED}❌${NC} ${1}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Consider creating a non-root user for better security."
    USER_HOME="/root"
    CURRENT_USER="root"
else
    USER_HOME="$HOME"
    CURRENT_USER="$USER"
fi

# Step 1: Update system
print_step "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Docker if not exists
if ! command -v docker &> /dev/null; then
    print_step "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# Step 3: Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    print_step "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose already installed"
fi

# Step 4: Install additional tools
print_step "Installing additional tools..."
apt install -y make git curl wget nano ufw
print_success "Additional tools installed"

# Step 5: Add user to docker group (if not root)
if [[ $EUID -ne 0 ]]; then
    print_step "Adding user to docker group..."
    usermod -aG docker $CURRENT_USER
    print_success "User added to docker group"
fi

# Step 6: Setup firewall
print_step "Configuring firewall..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 5678/tcp comment 'n8n (if needed)'
ufw --force enable
print_success "Firewall configured"

# Step 7: Create SSH key for GitHub Actions
print_step "Creating SSH key for GitHub Actions..."
SSH_KEY_PATH="$USER_HOME/.ssh/github_actions"
if [ ! -f "$SSH_KEY_PATH" ]; then
    ssh-keygen -t rsa -b 4096 -C "github-actions@sch-kpru.com" -f "$SSH_KEY_PATH" -N ""
    cat "$SSH_KEY_PATH.pub" >> "$USER_HOME/.ssh/authorized_keys"
    chmod 600 "$USER_HOME/.ssh/authorized_keys"
    print_success "SSH key created"
else
    print_warning "SSH key already exists"
fi

# Step 8: Create project directory
PROJECT_DIR="/home/sch-kpru"
print_step "Creating project directory..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 9: Clone repository (if not exists)
if [ ! -d ".git" ]; then
    print_step "Cloning SCH-KPRU repository..."
    git clone https://github.com/hamhapichai/SCH-KPRU.git .
    print_success "Repository cloned"
else
    print_step "Updating repository..."
    git pull origin develop
    print_success "Repository updated"
fi

# Step 10: Set proper permissions
chown -R $CURRENT_USER:$CURRENT_USER "$PROJECT_DIR"

# Step 11: Setup environment file
print_step "Setting up environment file..."
if [ ! -f ".env.prod" ]; then
    cp .env.prod.example .env.prod
    print_warning "Environment file created from template. Please edit .env.prod with your values!"
else
    print_warning "Environment file already exists"
fi

# Step 12: Create shared Docker network
print_step "Creating shared Docker network..."
docker network create sch-kpru-network || print_warning "Network already exists"
print_success "Shared network ready"

# Step 13: Create SSL directory
print_step "Creating SSL directory..."
mkdir -p "$PROJECT_DIR/nginx/ssl"
print_success "SSL directory created"

# Step 14: Show SSH private key
echo ""
echo "================================================"
echo "🔑 SSH PRIVATE KEY FOR GITHUB SECRETS"
echo "================================================"
echo "Copy the following private key to GitHub Secrets as 'SSH_PRIVATE_KEY':"
echo ""
echo "--- BEGIN PRIVATE KEY ---"
cat "$SSH_KEY_PATH"
echo "--- END PRIVATE KEY ---"
echo ""

# Step 15: Show next steps
echo "================================================"
echo "📋 NEXT STEPS"
echo "================================================"
echo ""
echo "1. 🔐 Add the SSH private key above to GitHub Secrets:"
echo "   Repository → Settings → Secrets → SSH_PRIVATE_KEY"
echo ""
echo "2. 🌐 Configure GitHub Secrets:"
echo "   SSH_PRIVATE_KEY=<paste the key above>"
echo "   SERVER_HOST=43.249.33.71"
echo "   SERVER_USER=$CURRENT_USER"
echo "   PROJECT_PATH=$PROJECT_DIR"
echo "   PRODUCTION_URL=https://yourdomain.com"
echo "   NEXT_PUBLIC_API_URL=https://yourdomain.com/api"
echo ""
echo "3. ⚙️ Edit environment file:"
echo "   nano $PROJECT_DIR/.env.prod"
echo ""
echo "4. 🔒 Setup SSL certificates:"
echo "   - Option 1: Use Cloudflare SSL (recommended)"
echo "   - Option 2: Use Let's Encrypt"
echo "   - Copy certificates to: $PROJECT_DIR/nginx/ssl/"
echo ""
echo "5. 🌍 Configure DNS (Cloudflare):"
echo "   yourdomain.com     A    43.249.33.71"
echo "   www.yourdomain.com A    43.249.33.71"
echo ""
echo "6. 🐳 Connect existing n8n to shared network:"
echo "   docker ps  # Find your n8n container name"
echo "   docker network connect sch-kpru-network <n8n_container_name>"
echo ""
echo "7. 🚀 Test deployment:"
echo "   cd $PROJECT_DIR"
echo "   make vps-network-setup"
echo "   make vps-deploy"
echo ""
echo "8. 🎯 Push to GitHub to trigger CI/CD:"
echo "   git push origin develop  # Staging"
echo "   git push origin main     # Production"
echo ""

# Step 16: Show current status
echo "================================================"
echo "📊 CURRENT VPS STATUS"
echo "================================================"
echo "Server IP: 43.249.33.71"
echo "Project Directory: $PROJECT_DIR"
echo "Current User: $CURRENT_USER"
echo "Docker Version: $(docker --version 2>/dev/null || echo 'Not installed')"
echo "Docker Compose Version: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
echo "Git Status: $(cd $PROJECT_DIR && git status --porcelain | wc -l) uncommitted changes"
echo ""

# Step 17: Check if n8n is running
echo "🔍 Checking for existing containers..."
echo "Existing containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Check if n8n is running
N8N_CONTAINER=$(docker ps --filter "name=n8n" --format "{{.Names}}" | head -n1)
if [ ! -z "$N8N_CONTAINER" ]; then
    print_success "Found n8n container: $N8N_CONTAINER"
    echo "To connect n8n to shared network, run:"
    echo "docker network connect sch-kpru-network $N8N_CONTAINER"
    echo ""
    echo "Current n8n access:"
    echo "- Direct: http://43.249.33.71:5678"
    echo "- Secure (after DNS setup): https://n8n.yourdomain.com"
else
    print_warning "No n8n container found. Make sure n8n is running before deploying SCH-KPRU."
    echo ""
    echo "To check all containers:"
    echo "docker ps"
fi

echo ""
print_success "VPS setup completed! 🎉"
print_warning "Don't forget to configure the items in NEXT STEPS above!"

# Show access URLs after deployment
echo ""
echo "================================================"
echo "🌐 POST-DEPLOYMENT ACCESS URLS"
echo "================================================"
echo ""
echo "SCH-KPRU Application:"
echo "- Main App: https://yourdomain.com"
echo "- API: https://yourdomain.com/api"
echo "- Health: https://yourdomain.com/health"
echo "- Swagger: https://yourdomain.com/swagger"
echo ""
echo "n8n Workflow Automation:"
echo "- Current: http://43.249.33.71:5678"
echo "- Secure (recommended): https://n8n.yourdomain.com"
echo ""
echo "🔐 Security Recommendations for n8n:"
echo "1. Setup subdomain: n8n.yourdomain.com"
echo "2. Enable basic authentication"
echo "3. Restrict IP access if needed"
echo "4. Use nginx reverse proxy"
echo ""
echo "See: n8n-access-configuration.md for details"

# Optional: Reboot notice
if [[ $EUID -ne 0 ]]; then
    echo ""
    print_warning "Consider rebooting to ensure all Docker permissions take effect:"
    echo "sudo reboot"
fi