@echo off
echo Fixing .env.production file...

REM Delete the old file
if exist ".env.production" del .env.production

REM Create new file with proper values
echo # Production Environment Configuration > .env.production
echo. >> .env.production
echo # Database Configuration >> .env.production
echo POSTGRES_DB=shop_acc_game >> .env.production
echo POSTGRES_USER=postgres >> .env.production
echo POSTGRES_PASSWORD=shopaccgame2024! >> .env.production
echo. >> .env.production
echo # pgAdmin Configuration >> .env.production
echo PGADMIN_EMAIL=admin@gurroshop.com >> .env.production
echo PGADMIN_PASSWORD=admin123! >> .env.production
echo. >> .env.production
echo # JWT Configuration >> .env.production
echo JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_minimum_256_bits_nvd_2024_production_secret >> .env.production
echo. >> .env.production
echo # Email Configuration >> .env.production
echo MAIL_USERNAME=gurroshop@gmail.com >> .env.production
echo MAIL_PASSWORD=ijhfgedfazirgdrx >> .env.production
echo. >> .env.production
echo # RAWG API Configuration >> .env.production
echo RAWG_API_KEY=5901cb0625a547eb922e9c700744032e >> .env.production
echo. >> .env.production
echo # Google OAuth2 Configuration >> .env.production
echo GOOGLE_CLIENT_ID=915027856276-41dpec5j8s73178jkiojn5nd15pb5sh5.apps.googleusercontent.com >> .env.production
echo GOOGLE_CLIENT_SECRET=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 >> .env.production
echo. >> .env.production
echo # Frontend Configuration >> .env.production
echo VITE_BACKEND_URL=https://api.gurroshop.com >> .env.production
echo. >> .env.production
echo # Monitoring Configuration >> .env.production
echo GRAFANA_PASSWORD=admin >> .env.production
echo. >> .env.production
echo # Security Settings >> .env.production
echo NODE_ENV=production >> .env.production
echo SPRING_PROFILES_ACTIVE=production >> .env.production

echo .env.production file created successfully!
echo.
echo Contents:
echo ==========
type .env.production
echo.
echo Environment file is ready for deployment!
pause 