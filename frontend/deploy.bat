@echo off
REM Frontend Deployment Script for Windows
REM This script helps build and deploy the frontend for different environments

echo 🚀 Starting frontend deployment...

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Create environment files if they don't exist
echo 📝 Creating environment files...

if not exist ".env.development" (
    echo VITE_BACKEND_URL=http://localhost:8080 > .env.development
    echo NODE_ENV=development >> .env.development
    echo ✅ Created .env.development
)

if not exist ".env.production" (
    echo VITE_BACKEND_URL=https://api.gurroshop.com > .env.production
    echo NODE_ENV=production >> .env.production
    echo ✅ Created .env.production
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build for production
echo 🔨 Building for production...
call npm run build

echo ✅ Build completed successfully!
echo.
echo 📁 Build output is in the 'dist' directory
echo.
echo 🧪 Testing production build...
echo    Run: npm run preview
echo    Then check browser console for configuration logs
echo.
echo 🌐 For production deployment:
echo    - Upload the contents of 'dist' to your web server
echo    - Ensure your backend is running on api.gurroshop.com
echo    - Configure your web server to serve the static files
echo.
echo 🔧 For development:
echo    - Run 'npm run dev' to start the development server
echo    - Backend should be running on localhost:8080
echo.
echo 📋 Environment files created:
echo    - .env.development (localhost:8080)
echo    - .env.production (api.gurroshop.com)

pause
