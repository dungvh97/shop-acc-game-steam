@echo off
title SHOP ACC GAME - LOCAL DEVELOPMENT SETUP
color 0A
cls

echo ========================================
echo    SHOP ACC GAME - LOCAL DEVELOPMENT
echo ========================================
echo.

:: Check if Java 17+ is installed
echo [1/6] Checking Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher and add it to PATH
    echo.
    pause
    exit /b 1
)

:: Check Java version
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%g
)
echo Found Java version: %JAVA_VERSION%
echo.
timeout /t 2 /nobreak >nul

:: Check if Maven is installed
echo [2/6] Checking Maven installation...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven and add it to PATH
    echo.
    pause
    exit /b 1
)
echo Maven is available
echo.
timeout /t 2 /nobreak >nul

:: Check if Node.js is installed
echo [3/6] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and add it to PATH
    echo.
    pause
    exit /b 1
)
echo Node.js is available
echo.
timeout /t 2 /nobreak >nul

:: Check if Docker is running and database is accessible
echo [4/6] Checking Docker database connection...
echo Attempting to connect to existing Docker PostgreSQL database...
echo Database: localhost:5432/shop_acc_game
echo Username: postgres
echo Password: shopaccgame2024!
echo.
timeout /t 3 /nobreak >nul

:: Create frontend environment file if it doesn't exist
if not exist "frontend\.env.local" (
    echo [5/6] Creating frontend environment file...
    echo VITE_API_BASE_URL=http://localhost:8080/api > frontend\.env.local
    echo VITE_GOOGLE_CLIENT_ID=915027856276-41dpec5j8s73178jkiojn5nd15pb5sh5.apps.googleusercontent.com >> frontend\.env.local
    echo Frontend environment file created at frontend\.env.local
    echo.
    timeout /t 3 /nobreak >nul
)

echo [6/6] Starting services...
echo.
echo ========================================
echo    STARTING SERVICES...
echo ========================================
echo.

:: Start Backend (in new window)
echo Starting Backend (Spring Boot)...
echo This will open in a new window...
start "Backend - Spring Boot" cmd /k "cd /d %CD%\backend && echo Starting Spring Boot application... && echo Connecting to Docker PostgreSQL database... && mvn spring-boot:run"

:: Wait for backend to start
echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak >nul

:: Start Frontend (in new window)
echo Starting Frontend (React + Vite)...
echo This will open in a new window...
start "Frontend - React" cmd /k "cd /d %CD%\frontend && echo Installing dependencies... && npm install && echo Starting development server on port 3000... && npm run dev -- --port 3000"

echo.
echo ========================================
echo    SERVICES STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:8080/api
echo Frontend: http://localhost:3000
echo Swagger:  http://localhost:8080/api/swagger-ui.html
echo.
echo Backend and Frontend are starting in separate windows.
echo Please wait for them to fully load.
echo.
echo IMPORTANT: Make sure your Docker PostgreSQL container is running!
echo Database connection: localhost:5432/shop_acc_game
echo.
echo Press any key to open the application in your browser...
pause >nul

:: Open browser
start http://localhost:3000

echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo If you encounter any issues:
echo 1. Check that Docker PostgreSQL is running on localhost:5432
echo 2. Ensure database 'shop_acc_game' exists in Docker
echo 3. Check the console windows for error messages
echo 4. Verify Java 17+ and Node.js 18+ are installed
echo 5. Frontend should be running on port 3000
echo.
echo Happy coding! 🚀
echo.
echo Press any key to close this window...
pause >nul 