@echo off
title SHOP ACC GAME - DOCKER DATABASE SETUP
color 0E
cls

echo ========================================
echo    DOCKER DATABASE SETUP FOR LOCAL DEVELOPMENT
echo ========================================
echo.

echo This script will help you set up PostgreSQL in Docker for local development.
echo.
echo Prerequisites:
echo 1. Docker must be installed and running
echo 2. Docker Compose should be available
echo 3. Ports 5432 should be available
echo.

:: Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop and ensure it's running.
    pause
    exit /b 1
)

echo Docker is available and running.
echo.

:: Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Docker Compose not found, using docker compose command...
    set DOCKER_COMPOSE_CMD=docker compose
) else (
    set DOCKER_COMPOSE_CMD=docker-compose
)

echo.
echo Checking if PostgreSQL container is already running...
docker ps --filter "name=postgres" --filter "publish=5432" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul

echo.
echo Options:
echo 1. Use existing Docker PostgreSQL container
echo 2. Start new PostgreSQL container
echo 3. Check Docker containers status
echo.

set /p choice="Choose an option (1-3): "

if "%choice%"=="1" (
    echo.
    echo Using existing Docker PostgreSQL container...
    echo Please ensure it's running on localhost:5432
    echo Database name should be: shop_acc_game
    echo Username: postgres
    echo Password: shopaccgame2024!
    echo.
    pause
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo Starting new PostgreSQL container...
    echo.
    
    :: Create docker-compose file if it doesn't exist
    if not exist "docker-compose.yml" (
        echo Creating docker-compose.yml file...
        echo version: '3.8' > docker-compose.yml
        echo services: >> docker-compose.yml
        echo   postgres: >> docker-compose.yml
        echo     image: postgres:14-alpine >> docker-compose.yml
        echo     container_name: shop_acc_game_postgres >> docker-compose.yml
        echo     environment: >> docker-compose.yml
        echo       POSTGRES_DB: shop_acc_game >> docker-compose.yml
        echo       POSTGRES_USER: postgres >> docker-compose.yml
        echo       POSTGRES_PASSWORD: shopaccgame2024! >> docker-compose.yml
        echo     ports: >> docker-compose.yml
        echo       - "5432:5432" >> docker-compose.yml
        echo     volumes: >> docker-compose.yml
        echo       - postgres_data:/var/lib/postgresql/data >> docker-compose.yml
        echo     restart: unless-stopped >> docker-compose.yml
        echo volumes: >> docker-compose.yml
        echo   postgres_data: >> docker-compose.yml
        echo Docker Compose file created!
        echo.
    )
    
    echo Starting PostgreSQL container...
    %DOCKER_COMPOSE_CMD% up -d postgres
    
    echo.
    echo Waiting for PostgreSQL to start...
    timeout /t 10 /nobreak >nul
    
    echo PostgreSQL container started!
    echo.
    goto :check_status
)

if "%choice%"=="3" (
    echo.
    echo Checking Docker containers status...
    echo.
    docker ps -a --filter "name=postgres"
    echo.
    pause
    goto :end
)

echo Invalid choice. Please run the script again.
pause
exit /b 1

:check_status
echo Checking container status...
docker ps --filter "name=postgres" --filter "publish=5432"

echo.
echo Testing database connection...
echo Attempting to connect to PostgreSQL...

:: Wait a bit more for PostgreSQL to be ready
timeout /t 5 /nobreak >nul

:: Test connection using Docker exec
docker exec shop_acc_game_postgres psql -U postgres -d shop_acc_game -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo Database connection successful!
    echo.
    echo Database setup complete!
    echo.
    echo You can now run the application with:
    echo - run-local.bat (first time setup)
    echo - start-services.bat (subsequent runs)
    echo.
    echo Database details:
    echo - Host: localhost
    echo - Port: 5432
    echo - Database: shop_acc_game
    echo - Username: postgres
    echo - Password: shopaccgame2024!
    echo.
) else (
    echo.
    echo WARNING: Could not test database connection yet.
    echo PostgreSQL might still be starting up.
    echo Please wait a few more seconds and try running the application.
    echo.
)

:end
echo ========================================
echo    SETUP COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. Ensure PostgreSQL container is running
echo 2. Run run-local.bat to start the application
echo 3. Or run start-services.bat for quick start
echo.
echo Database connection details:
echo - Host: localhost:5432
echo - Database: shop_acc_game
echo - Username: postgres
echo - Password: shopaccgame2024!
echo.
pause 