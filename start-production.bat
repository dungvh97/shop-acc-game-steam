@echo off
echo Starting Shop Acc Game Platform in PRODUCTION mode...

echo Checking if port 5432 is in use...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":5432 .*LISTENING"') do (
  set PID=%%a
)
if defined PID (
  echo Port 5432 is in use by PID %PID%. Attempting to terminate it...
  taskkill /F /PID %PID% >nul 2>&1
  timeout /t 1 /nobreak > nul
  set PID=
)

echo Starting PostgreSQL database...
docker-compose up -d

echo Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo Starting Spring Boot backend...
cd backend
start "Backend" cmd /k "mvn spring-boot:run"
cd ..

echo Building React frontend for PRODUCTION...
cd frontend
echo Creating production environment file...
if not exist ".env.production" (
    echo VITE_BACKEND_URL=https://api.gurroshop.com > .env.production
    echo NODE_ENV=production >> .env.production
    echo Created .env.production file
)

echo Building production version...
call npm run build

echo Starting production preview server on port 3000...
start "Frontend Production" cmd /k "npm run preview -- --port 3000"
cd ..

echo All services started in PRODUCTION mode!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000 (production build)
echo pgAdmin: http://localhost:5050
echo.
echo NOTE: Frontend is now using PRODUCTION settings (api.gurroshop.com)
echo Check browser console to verify configuration.
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping all services...
docker-compose down
taskkill /f /im java.exe 2>nul
taskkill /f /im node.exe 2>nul
echo All services stopped.
