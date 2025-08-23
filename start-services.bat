@echo off
title SHOP ACC GAME - START SERVICES
color 0B
cls

echo ========================================
echo    STARTING SHOP ACC GAME SERVICES
echo ========================================
echo.

echo Checking Docker database connection...
echo Make sure your Docker PostgreSQL container is running!
echo Database: localhost:5432/shop_acc_game
echo Username: postgres
echo Password: shopaccgame2024!
echo.
timeout /t 3 /nobreak >nul

echo Starting Backend (Spring Boot)...
echo This will open in a new window...
start "Backend - Spring Boot" cmd /k "cd /d %CD%\backend && echo Starting Spring Boot application... && echo Connecting to Docker PostgreSQL database... && mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting Frontend (React + Vite)...
echo This will open in a new window...
start "Frontend - React" cmd /k "cd /d %CD%\frontend && echo Starting development server on port 3000... && npm run dev -- --port 3000"

echo.
echo ========================================
echo    SERVICES STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:8080/api
echo Frontend: http://localhost:3000
echo Swagger:  http://localhost:8080/api/swagger-ui.html
echo.
echo Both services are starting in separate windows.
echo Please wait for them to fully load.
echo.
echo IMPORTANT: Make sure your Docker PostgreSQL container is running!
echo Database connection: localhost:5432/shop_acc_game
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000
echo Application opened in browser!
echo.
echo Services are running in separate windows.
echo You can close this window now.
echo.
pause >nul 