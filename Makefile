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
# SSL/HTTPS Commands (Optional)
# ===========================================

ssl-generate: ## Generate self-signed SSL certificate
	@echo "Generating self-signed SSL certificate..."
	mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/key.pem \
		-out nginx/ssl/cert.pem \
		-subj "/C=TH/ST=Kamphaeng Phet/L=Kamphaeng Phet/O=KPRU/CN=localhost"

ssl-enable: ## Enable HTTPS in nginx configuration
	@echo "Enabling HTTPS in nginx configuration..."
	@sed -i 's/# server {/server {/' nginx/nginx.conf
	@sed -i 's/#     listen 443/#     listen 443/' nginx/nginx.conf
	@echo "HTTPS enabled. Restart nginx service to apply changes."

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