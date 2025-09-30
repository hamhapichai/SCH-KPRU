# ===========================================
# SCH-KPRU Docker Makefile
# ===========================================
# This Makefile provides convenient commands for managing
# the SCH-KPRU application with Docker

.PHONY: help build up down restart logs clean dev prod backup restore

# Default target
help: ## Show this help message
	@echo "SCH-KPRU Docker Management Commands"
	@echo "==================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ===========================================
# Development Commands
# ===========================================

dev-build: ## Build all services for development
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml build

dev-up: ## Start all services in development mode
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml up -d

dev-down: ## Stop all development services
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml down

dev-logs: ## Show logs from development services
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml logs -f

dev-restart: ## Restart all development services
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml restart

# ===========================================
# Production Commands
# ===========================================

prod-build: ## Build all services for production
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start all services in production mode
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop all production services
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Show logs from production services
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart: ## Restart all production services
	docker-compose -f docker-compose.prod.yml restart

# ===========================================
# Database Commands
# ===========================================

db-backup: ## Backup PostgreSQL database
	@echo "Creating database backup..."
	docker exec sch-kpru-postgres-prod pg_dump -U sch_kpru_user -d sch_kpru_prod > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore PostgreSQL database (usage: make db-restore FILE=backup_file.sql)
	@echo "Restoring database from $(FILE)..."
	docker exec -i sch-kpru-postgres-prod psql -U sch_kpru_user -d sch_kpru_prod < $(FILE)

db-shell: ## Access PostgreSQL shell
	docker exec -it sch-kpru-postgres-prod psql -U sch_kpru_user -d sch_kpru_prod

db-migrate: ## Run Entity Framework migrations
	docker exec sch-kpru-backend-prod dotnet ef database update

# ===========================================
# Utility Commands
# ===========================================

status: ## Show status of all services
	docker-compose -f docker-compose.prod.yml ps

health: ## Check health of all services
	@echo "Checking service health..."
	@docker ps --filter "name=sch-kpru" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean: ## Remove all containers, volumes, and images
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml down -v --rmi all

clean-volumes: ## Remove all volumes (WARNING: This will delete all data)
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml down -v

logs-backend: ## Show backend logs
	docker-compose -f docker-compose.prod.yml logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose -f docker-compose.prod.yml logs -f frontend

logs-db: ## Show database logs
	docker-compose -f docker-compose.prod.yml logs -f postgres

# ===========================================
# Deployment Commands
# ===========================================

deploy-dev: dev-build dev-up ## Build and deploy to development
	@echo "Development environment deployed successfully!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:8080"
	@echo "PgAdmin: http://localhost:5050 (admin@sch-kpru.dev / admin123)"

deploy-prod: prod-build prod-up ## Build and deploy to production
	@echo "Production environment deployed successfully!"
	@echo "Application: http://localhost"
	@echo "API Documentation: http://localhost/api/swagger"

# ===========================================
# Monitoring Commands
# ===========================================

monitor: ## Show real-time resource usage
	docker stats $$(docker ps --filter "name=sch-kpru" --format "{{.Names}}")

disk-usage: ## Show disk usage by containers
	docker system df -v

# ===========================================
# SSL/HTTPS Commands
# ===========================================

ssl-generate: ## Generate self-signed SSL certificate
	@echo "Generating self-signed SSL certificate..."
	mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/key.pem \
		-out nginx/ssl/cert.pem \
		-subj "/C=TH/ST=Kamphaeng Phet/L=Kamphaeng Phet/O=KPRU/CN=localhost"

ssl-letsencrypt: ## Generate Let's Encrypt SSL certificate (production)
	@echo "Generating Let's Encrypt SSL certificate..."
	@read -p "Enter your domain (e.g., yourdomain.com): " domain; \
	read -p "Enter your email: " email; \
	docker-compose -f docker-compose.prod.yml stop nginx; \
	sudo certbot certonly --standalone -d $$domain -d www.$$domain --email $$email --agree-tos --no-eff-email; \
	sudo mkdir -p nginx/ssl; \
	sudo cp /etc/letsencrypt/live/$$domain/fullchain.pem nginx/ssl/cert.pem; \
	sudo cp /etc/letsencrypt/live/$$domain/privkey.pem nginx/ssl/key.pem; \
	sudo chown $$USER:$$USER nginx/ssl/*; \
	docker-compose -f docker-compose.prod.yml start nginx

ssl-renew: ## Renew SSL certificate
	@echo "Renewing SSL certificate..."
	sudo certbot renew --quiet
	sudo cp /etc/letsencrypt/live/*/fullchain.pem nginx/ssl/cert.pem
	sudo cp /etc/letsencrypt/live/*/privkey.pem nginx/ssl/key.pem
	sudo chown $$USER:$$USER nginx/ssl/*
	docker restart sch-kpru-nginx-prod

ssl-check: ## Check SSL certificate expiry
	@echo "Checking SSL certificate..."
	openssl x509 -in nginx/ssl/cert.pem -text -noout | grep -E "(Not Before|Not After)"

ssl-test: ## Test SSL connection
	@read -p "Enter your domain: " domain; \
	echo "Testing SSL connection to $$domain..."; \
	openssl s_client -connect $$domain:443 -servername $$domain -brief

# ===========================================
# Nginx/Reverse Proxy Commands  
# ===========================================

nginx-config-prod: ## Switch to production nginx config
	@echo "Switching to production nginx configuration..."
	cp nginx/nginx.conf nginx/nginx.conf.backup
	cp nginx/nginx-production.conf nginx/nginx.conf
	@echo "⚠️  Remember to update domain name in nginx.conf"

nginx-config-dev: ## Switch to development nginx config  
	@echo "Switching to development nginx configuration..."
	cp nginx/nginx.conf.backup nginx/nginx.conf || echo "No backup found"

nginx-test: ## Test nginx configuration
	@echo "Testing nginx configuration..."
	docker exec sch-kpru-nginx-prod nginx -t || echo "Nginx container not running"

nginx-reload: ## Reload nginx configuration
	@echo "Reloading nginx configuration..."
	docker exec sch-kpru-nginx-prod nginx -s reload

nginx-status: ## Show nginx status and connections
	@echo "Nginx status and connections:"
	docker exec sch-kpru-nginx-prod ss -tulpn
	@echo "\nNginx processes:"
	docker exec sch-kpru-nginx-prod ps aux | grep nginx

nginx-logs: ## Show nginx access and error logs
	@echo "=== Nginx Access Logs ==="
	docker exec sch-kpru-nginx-prod tail -20 /var/log/nginx/access.log
	@echo "\n=== Nginx Error Logs ==="
	docker exec sch-kpru-nginx-prod tail -20 /var/log/nginx/error.log

nginx-logs-live: ## Monitor nginx logs in real-time
	@echo "Monitoring nginx logs (Ctrl+C to stop)..."
	docker logs -f sch-kpru-nginx-prod

nginx-cache-clear: ## Clear nginx cache
	@echo "Clearing nginx cache..."
	docker exec sch-kpru-nginx-prod find /var/cache/nginx -type f -delete || echo "Cache directory not found"

# ===========================================
# Health Check Commands
# ===========================================

health-full: ## Complete health check of all services
	@echo "🔍 Full system health check..."
	@echo "\n1. Checking nginx..."
	curl -s -o /dev/null -w "Nginx: %{http_code}\n" http://localhost/health || echo "Nginx: FAILED"
	@echo "\n2. Checking backend API..."
	curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost/api/health || echo "Backend: FAILED"
	@echo "\n3. Checking frontend..."
	curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost/ || echo "Frontend: FAILED"
	@echo "\n4. Checking database..."
	docker exec sch-kpru-postgres-prod pg_isready -U sch_kpru_user && echo "Database: OK" || echo "Database: FAILED"
	@echo "\n5. Checking SSL (if HTTPS)..."
	openssl x509 -in nginx/ssl/cert.pem -checkend 86400 -noout && echo "SSL: OK (valid for >24h)" || echo "SSL: WARNING (expires soon)"

health-ssl: ## Check SSL certificate health
	@echo "Checking SSL certificate..."
	@if [ -f nginx/ssl/cert.pem ]; then \
		openssl x509 -in nginx/ssl/cert.pem -text -noout | grep -E "(Not Before|Not After)"; \
		openssl x509 -in nginx/ssl/cert.pem -checkend 2592000 -noout && echo "✅ SSL certificate is valid for next 30 days" || echo "⚠️  SSL certificate expires within 30 days"; \
	else \
		echo "❌ SSL certificate not found"; \
	fi

health-domain: ## Test domain accessibility  
	@read -p "Enter your domain (e.g., yourdomain.com): " domain; \
	echo "Testing domain accessibility..."; \
	curl -I -s --max-time 10 "https://$$domain/health" && echo "✅ Domain is accessible" || echo "❌ Domain is not accessible"

# ===========================================
# Backup and Maintenance
# ===========================================

backup-all: ## Create full backup of application data
	@echo "Creating full backup..."
	mkdir -p backups
	docker run --rm -v sch-kpru_postgres_data:/data -v $$(pwd)/backups:/backup alpine tar czf /backup/postgres_backup_$$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
	@echo "Backup created in backups/ directory"

maintenance-logs: ## Clean old log files
	@echo "Cleaning old log files..."
	docker exec sch-kpru-nginx-prod find /var/log/nginx -name "*.log" -mtime +7 -delete
	@echo "Old logs cleaned"

# ===========================================
# Quick Commands
# ===========================================

rebuild-backend: ## Rebuild only backend service
	docker-compose -f docker-compose.prod.yml build backend
	docker-compose -f docker-compose.prod.yml up -d backend

rebuild-frontend: ## Rebuild only frontend service
	docker-compose -f docker-compose.prod.yml build frontend
	docker-compose -f docker-compose.prod.yml up -d frontend

restart-nginx: ## Restart nginx service
	docker-compose -f docker-compose.prod.yml restart nginx

# ===========================================
# Environment Setup
# ===========================================

setup-env: ## Setup environment files
	@echo "Setting up environment files..."
	@if [ ! -f .env.prod ]; then \
		cp .env.prod.example .env.prod; \
		echo "Created .env.prod from template. Please update with your values."; \
	else \
		echo ".env.prod already exists."; \
	fi

check-env: ## Check if all required environment variables are set
	@echo "Checking environment variables..."
	@if [ ! -f .env.prod ]; then \
		echo "❌ .env.prod file not found. Run 'make setup-env' first."; \
		exit 1; \
	fi
	@echo "✅ Environment file exists"
	@grep -q "POSTGRES_PASSWORD=" .env.prod && echo "✅ POSTGRES_PASSWORD is set" || echo "❌ POSTGRES_PASSWORD not set"
	@grep -q "JWT_SECRET=" .env.prod && echo "✅ JWT_SECRET is set" || echo "❌ JWT_SECRET not set"
	@grep -q "API_URL=" .env.prod && echo "✅ API_URL is set" || echo "❌ API_URL not set"

# ===========================================
# Help and Information
# ===========================================

info: ## Show application information and URLs
	@echo "SCH-KPRU Application Information"
	@echo "================================="
	@echo "Environment: Production"
	@echo "Main Application: http://localhost"
	@echo "API Documentation: http://localhost/api/swagger"
	@echo "Health Check: http://localhost/health"
	@echo ""
	@echo "Database: localhost:5432 (internal only)"
	@echo "PgAdmin: http://localhost:5050 (dev only)"
	@echo ""
	@echo "To check service status: make status"
	@echo "To view logs: make logs"
	@echo "To restart services: make prod-restart"

# ===========================================
# Emergency Commands
# ===========================================

emergency-stop: ## Emergency stop all services
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml down --remove-orphans

emergency-clean: ## Emergency cleanup (removes everything)
	docker-compose -f docker-compose.prod.yml -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker system prune -f
	docker volume prune -f

# ===========================================
# CI/CD Commands
# ===========================================

registry-deploy: ## Deploy using images from GitHub Container Registry
	@echo "Deploying from GitHub Container Registry..."
	docker-compose -f docker-compose.registry.yml up -d

registry-pull: ## Pull latest images from registry
	@echo "Pulling latest images from registry..."
	docker pull ghcr.io/hamhapichai/sch-kpru/backend:latest || echo "Backend image not found"
	docker pull ghcr.io/hamhapichai/sch-kpru/frontend:latest || echo "Frontend image not found"

registry-login: ## Login to GitHub Container Registry
	@echo "Logging into GitHub Container Registry..."
	@echo "Please provide your GitHub token when prompted:"
	@read -p "GitHub Username: " username; \
	echo $$GITHUB_TOKEN | docker login ghcr.io -u $$username --password-stdin

registry-build-push: ## Build and push images to registry
	@echo "Building and pushing images to registry..."
	docker build -t ghcr.io/hamhapichai/sch-kpru/backend:latest ./backend/SchKpruApi
	docker build -t ghcr.io/hamhapichai/sch-kpru/frontend:latest ./frontend
	docker push ghcr.io/hamhapichai/sch-kpru/backend:latest
	docker push ghcr.io/hamhapichai/sch-kpru/frontend:latest

ci-test: ## Run CI tests locally
	@echo "Running CI tests locally..."
	@echo "Testing backend..."
	cd backend/SchKpruApi && dotnet test --verbosity normal
	@echo "Testing frontend..."
	cd frontend && bun test || npm test -- --passWithNoTests

cd-deploy: registry-pull registry-deploy ## Complete CD deployment process
	@echo "CD deployment completed!"
	@echo "Waiting for services to start..."
	sleep 30
	@echo "Checking service health..."
	make health

# ===========================================
# VPS Deployment Commands
# ===========================================

vps-deploy: ## Deploy to VPS using docker-compose.vps.yml
	@echo "Deploying to VPS..."
	docker-compose -f docker-compose.vps.yml up -d

vps-logs: ## Show VPS deployment logs
	docker-compose -f docker-compose.vps.yml logs -f

vps-status: ## Show VPS services status
	docker-compose -f docker-compose.vps.yml ps

vps-stop: ## Stop VPS services
	docker-compose -f docker-compose.vps.yml down

vps-restart: ## Restart VPS services
	docker-compose -f docker-compose.vps.yml restart

vps-update: ## Update VPS services with latest images
	@echo "Pulling latest images..."
	docker pull ghcr.io/hamhapichai/sch-kpru/backend:latest
	docker pull ghcr.io/hamhapichai/sch-kpru/frontend:latest
	@echo "Updating services..."
	export BACKEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/backend:latest; \
	export FRONTEND_IMAGE=ghcr.io/hamhapichai/sch-kpru/frontend:latest; \
	docker-compose -f docker-compose.vps.yml up -d

vps-network-setup: ## Setup shared Docker network for VPS
	@echo "Setting up shared Docker network..."
	docker network create sch-kpru-network || echo "Network already exists"
	@echo "Network created. Connect your existing n8n container to this network:"
	@echo "docker network connect sch-kpru-network <n8n_container_name>"

vps-connect-n8n: ## Connect existing n8n container to shared network
	@read -p "Enter your n8n container name: " n8n_container; \
	docker network connect sch-kpru-network $$n8n_container && \
	echo "✅ n8n container connected to shared network" || \
	echo "❌ Failed to connect n8n container"

vps-health: ## Check VPS deployment health
	@echo "🔍 Checking VPS deployment health..."
	@echo "\n1. Docker containers:"
	docker ps --filter "name=sch-kpru" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo "\n2. Network connectivity:"
	docker network inspect sch-kpru-network --format "{{.Name}}: {{len .Containers}} containers connected"
	@echo "\n3. Health checks:"
	curl -s -o /dev/null -w "Nginx: %{http_code}\n" http://localhost/health || echo "Nginx: FAILED"
	curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost/api/health || echo "Backend: FAILED"