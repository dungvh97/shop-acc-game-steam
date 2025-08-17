@echo off
echo Testing Frontend Service...
echo.

echo 1. Testing health endpoint...
curl -s http://localhost:3000/health
echo.
echo.

echo 2. Testing index.html...
curl -s -I http://localhost:3000/ | findstr "HTTP"
echo.

echo 3. Testing if assets directory exists...
curl -s -I http://localhost:3000/assets/ | findstr "HTTP"
echo.

echo 4. Testing a specific JS file (if exists)...
for /f "tokens=*" %%i in ('curl -s http://localhost:3000/ ^| findstr "index-.*\.js"') do (
    echo Found JS file: %%i
    set JS_FILE=%%i
)

echo 5. Testing a specific CSS file (if exists)...
for /f "tokens=*" %%i in ('curl -s http://localhost:3000/ ^| findstr "index-.*\.css"') do (
    echo Found CSS file: %%i
    set CSS_FILE=%%i
)

echo.
echo 6. Testing Cloudflare Tunnel access...
echo Frontend should be accessible at: https://gurroshop.com
echo Backend should be accessible at: https://api.gurroshop.com
echo.

echo 7. Checking Docker container status...
docker-compose -f docker-compose.cloudflare.yml ps frontend
echo.

echo Test completed!
pause 