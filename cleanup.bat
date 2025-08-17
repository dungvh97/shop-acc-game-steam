@echo off
echo ========================================
echo Cleaning up shop-acc-game project...
echo ========================================

echo.
echo Cleaning frontend build artifacts...
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
    echo ✓ Removed frontend\dist
) else (
    echo - frontend\dist already clean
)

echo.
echo Cleaning backend build artifacts...
if exist "backend\target" (
    rmdir /s /q "backend\target"
    echo ✓ Removed backend\target
) else (
    echo - backend\target already clean
)

echo.
echo Cleaning logs...
if exist "logs" (
    rmdir /s /q "logs"
    echo ✓ Removed logs directory
) else (
    echo - logs directory already clean
)

echo.
echo Cleaning temporary files...
for %%f in (*.tmp *.log) do (
    if exist "%%f" (
        del /q "%%f"
        echo ✓ Removed %%f
    )
)

echo.
echo Cleaning IDE files...
if exist ".vscode" (
    rmdir /s /q ".vscode"
    echo ✓ Removed .vscode directory
)

if exist ".idea" (
    rmdir /s /q ".idea"
    echo ✓ Removed .idea directory
)

echo.
echo ========================================
echo Cleanup completed!
echo ========================================
echo.
echo To rebuild and deploy to Cloudflare:
echo   deploy-cloudflare.bat
echo.
pause 