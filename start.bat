@echo off
echo Starting Shop Acc Game Platform...

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

echo Starting React frontend with Vite...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo All services started!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo pgAdmin: http://localhost:5050
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping all services...
docker-compose down
taskkill /f /im java.exe 2>nul
taskkill /f /im node.exe 2>nul
echo All services stopped.
