# Project Maintenance Guide

This guide explains how to keep your shop-acc-game project clean and organized on Windows.

## Quick Cleanup

```bash
cleanup.bat
```

## Manual Cleanup Steps

### 1. Frontend Cleanup
```bash
cd frontend
rmdir /s /q dist          # Remove build output
rmdir /s /q node_modules  # Remove dependencies (reinstall with npm ci)
```

### 2. Backend Cleanup
```bash
cd backend
mvn clean                 # Clean Maven build artifacts
rmdir /s /q target        # Remove build output
```

### 3. General Cleanup
```bash
# Remove logs
rmdir /s /q logs

# Remove IDE files
rmdir /s /q .vscode
rmdir /s /q .idea

# Remove temporary files
del /q *.tmp
del /q *.log
```

## Deployment

### Cloudflare Deployment (Primary)
```bash
deploy-cloudflare.bat
```

This will:
- Build and deploy your application to Cloudflare
- Set up all necessary services (frontend, backend, database, monitoring)
- Configure proper networking and security

## What Gets Ignored by Git

The `.gitignore` file is configured to ignore:

- **Build artifacts**: `dist/`, `build/`, `target/`
- **Dependencies**: `node_modules/`, `.mvn/`
- **Environment files**: `.env*`
- **Logs**: `logs/`, `*.log`
- **IDE files**: `.vscode/`, `.idea/`
- **Cache files**: `.cache/`, `.eslintcache`
- **Temporary files**: `*.tmp`, `*.bak`
- **Uploads**: `backend/uploads/`, `frontend/public/uploads/` (except `.gitkeep`)

## Before Deploying

1. **Run cleanup script** to remove build artifacts
2. **Check environment configuration** (`.env.production`)
3. **Verify no large files** are being committed
4. **Test locally** if possible

## Environment Configuration

- **Never commit** `.env` files
- Use `env.production.template` as a reference
- Create `.env.production` with your actual values
- Ensure all required environment variables are set

## Dependency Management

### Frontend
```bash
cd frontend
npm ci              # Clean install
npm run build       # Build for production
npm run dev         # Development server (local testing)
```

### Backend
```bash
cd backend
mvn clean install   # Clean build and install
mvn spring-boot:run # Run development server (local testing)
```

## Monitoring and Logs

After deployment, monitor your services:

```bash
# View all services
docker-compose -f docker-compose.cloudflare.yml ps

# View logs
docker-compose -f docker-compose.cloudflare.yml logs -f

# View specific service logs
docker-compose -f docker-compose.cloudflare.yml logs -f frontend
docker-compose -f docker-compose.cloudflare.yml logs -f backend
```

## Management Interfaces

After deployment, access these interfaces locally:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **pgAdmin**: http://localhost:5050

## Troubleshooting

### Build Issues After Cleanup
1. Reinstall dependencies: `npm ci` (frontend) or `mvn clean install` (backend)
2. Clear cache: `npm cache clean --force` or `mvn clean`
3. Check environment variables in `.env.production`

### Deployment Issues
1. Ensure Docker is running
2. Check `.env.production` file exists and is properly configured
3. Verify network connectivity
4. Check Docker logs for specific error messages

### Service Issues
```bash
# Stop all services
docker-compose -f docker-compose.cloudflare.yml down

# Restart all services
docker-compose -f docker-compose.cloudflare.yml up -d

# Rebuild and restart
docker-compose -f docker-compose.cloudflare.yml up --build -d
```

## Regular Maintenance Schedule

- **Weekly**: Run cleanup scripts before deployment
- **Monthly**: Review and update dependencies
- **Before releases**: Full cleanup and environment audit 