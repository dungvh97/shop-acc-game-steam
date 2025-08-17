@echo off
echo Starting Production Deployment for Shop Acc Game Platform...

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
if not exist "nginx-proxy\ssl" mkdir nginx-proxy\ssl
if not exist "nginx-proxy\logs" mkdir nginx-proxy\logs
if not exist "logs\backend" mkdir logs\backend
if not exist "backups" mkdir backups
if not exist "monitoring" mkdir monitoring

REM Check SSL certificates
if not exist "nginx-proxy\ssl\cert.pem" (
    echo SSL certificates not found in nginx-proxy\ssl\
    echo Please place your SSL certificates:
    echo   - nginx-proxy\ssl\cert.pem (SSL certificate)
    echo   - nginx-proxy\ssl\key.pem (Private key)
    echo.
    echo For testing, you can generate self-signed certificates using OpenSSL
    echo or copy existing certificates to the nginx-proxy\ssl\ directory.
    echo.
    set /p generate_cert="Do you want to continue without SSL certificates? (y/N): "
    if /i "%generate_cert%"=="y" (
        echo Continuing without SSL certificates - HTTPS will not work
    ) else (
        echo SSL certificates required for production deployment
        pause
        exit /b 1
    )
)

REM Stop existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Remove old images to ensure fresh build
echo Cleaning up old images...
docker system prune -f

REM Build and start production services
echo Building and starting production services...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 30 /nobreak > nul

REM Check service health
echo Checking service health...
docker-compose -f docker-compose.prod.yml ps

echo.
echo Production deployment completed!
echo.
echo Access your application:
echo   - Frontend: http://localhost (or https://localhost if SSL configured)
echo   - Backend API: http://localhost/api (or https://localhost/api if SSL configured)
echo   - API Docs: http://localhost/api/swagger-ui.html
echo.
echo Management interfaces:
echo   - Prometheus: http://localhost:9090
echo   - Grafana: http://localhost:3001 (admin/admin)
echo   - pgAdmin: http://localhost:5050
echo.
echo Monitor logs:
echo   docker-compose -f docker-compose.prod.yml logs -f [service-name]
echo.
echo To stop services:
echo   docker-compose -f docker-compose.prod.yml down
echo.
pause 