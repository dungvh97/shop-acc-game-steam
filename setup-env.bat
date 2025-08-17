@echo off
echo Setting up production environment file...
echo.

REM Check if .env.production already exists
if exist ".env.production" (
    echo .env.production already exists!
    echo.
    echo Current contents:
    echo =================
    type .env.production
    echo.
    echo Do you want to overwrite it? (y/N)
    set /p overwrite="Enter choice: "
    if /i not "%overwrite%"=="y" (
        echo Keeping existing .env.production file.
        pause
        exit /b 0
    )
)

REM Copy template if it exists
if exist "env.production.template" (
    echo Copying from template...
    copy env.production.template .env.production
    echo Template copied successfully!
) else (
    echo Creating new .env.production file...
    echo # Production Environment Configuration > .env.production
    echo POSTGRES_DB=shop_acc_game >> .env.production
    echo POSTGRES_USER=postgres >> .env.production
    echo POSTGRES_PASSWORD= >> .env.production
    echo PGADMIN_EMAIL=admin@shopaccgame.com >> .env.production
    echo PGADMIN_PASSWORD= >> .env.production
    echo JWT_SECRET= >> .env.production
    echo MAIL_USERNAME=gurroshop@gmail.com >> .env.production
    echo MAIL_PASSWORD=ijhfgedfazirgdrx >> .env.production
    echo RAWG_API_KEY=5901cb0625a547eb922e9c700744032e >> .env.production
    echo GOOGLE_CLIENT_ID=915027856276-41dpec5j8s73178jkiojn5nd15pb5sh5.apps.googleusercontent.com >> .env.production
    echo GOOGLE_CLIENT_SECRET=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 >> .env.production
    echo VITE_BACKEND_URL=https://api.gurroshop.com >> .env.production
    echo GRAFANA_PASSWORD=admin >> .env.production
    echo NODE_ENV=production >> .env.production
    echo SPRING_PROFILES_ACTIVE=production >> .env.production
)

echo.
echo .env.production file created/updated!
echo.
echo IMPORTANT: You need to fill in the following values:
echo.
echo 1. POSTGRES_PASSWORD - Your secure database password
echo 2. PGADMIN_PASSWORD - Your secure pgAdmin password  
echo 3. JWT_SECRET - A very long random string for JWT signing
echo.
echo The file will now open for editing...
echo.
pause

REM Open the file for editing
notepad .env.production

echo.
echo After editing, save the file and close Notepad.
echo Then run: deploy-cloudflare.bat
echo.
pause 