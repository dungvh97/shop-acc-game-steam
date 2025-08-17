@echo off
echo Starting Cloudflare Production Deployment for Shop Acc Game Platform...

REM Check if .env.production exists
if not exist ".env.production" (
    echo .env.production file not found!
    echo Please create .env.production file with your production configuration.
    echo You can copy from env.production.template and fill in your values:
    echo   copy env.production.template .env.production
    echo   # Then edit .env.production with your actual values
    pause
    exit /b 1
)

REM Create necessary directories
echo Creating necessary directories...
if not exist "logs\backend" mkdir logs\backend
if not exist "backups" mkdir backups
if not exist "monitoring" mkdir monitoring

REM Stop existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.cloudflare.yml down

REM Remove old images to ensure fresh build
echo Cleaning up old images...
docker system prune -f

REM Build and start production services
echo Building and starting Cloudflare-optimized services...
docker-compose -f docker-compose.cloudflare.yml up --build -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 30 /nobreak > nul

REM Check service health
echo Checking service health...
docker-compose -f docker-compose.cloudflare.yml ps

echo.
echo Cloudflare production deployment completed!
echo.
echo Your services are now running behind Cloudflare:
echo   - Frontend: https://gurroshop.com (via Cloudflare)
echo   - Backend API: https://api.gurroshop.com (via Cloudflare)
echo   - Direct access: http://localhost:3000 (frontend), http://localhost:8080 (backend)
echo.
echo Management interfaces (localhost only):
echo   - Prometheus: http://localhost:9090
echo   - Grafana: http://localhost:3001 (admin/admin)
echo   - pgAdmin: http://localhost:5050
echo.
echo Next steps for Cloudflare integration:
echo 1. Set up Cloudflare Tunnel (recommended) or
echo 2. Point your domain A records to your server IP
echo.
echo Monitor logs:
echo   docker-compose -f docker-compose.cloudflare.yml logs -f [service-name]
echo.
echo To stop services:
echo   docker-compose -f docker-compose.cloudflare.yml down
echo.
pause 