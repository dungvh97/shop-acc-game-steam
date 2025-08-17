#!/bin/bash

echo "========================================"
echo "Cleaning up shop-acc-game project..."
echo "========================================"

echo
echo "Cleaning frontend build artifacts..."
if [ -d "frontend/dist" ]; then
    rm -rf "frontend/dist"
    echo "✓ Removed frontend/dist"
else
    echo "- frontend/dist already clean"
fi

if [ -d "frontend/node_modules" ]; then
    echo "- Keeping frontend/node_modules (use 'npm ci' to reinstall)"
fi

echo
echo "Cleaning backend build artifacts..."
if [ -d "backend/target" ]; then
    rm -rf "backend/target"
    echo "✓ Removed backend/target"
else
    echo "- backend/target already clean"
fi

echo
echo "Cleaning logs..."
if [ -d "logs" ]; then
    rm -rf "logs"
    echo "✓ Removed logs directory"
else
    echo "- logs directory already clean"
fi

echo
echo "Cleaning temporary files..."
find . -name "*.tmp" -type f -delete 2>/dev/null && echo "✓ Removed temporary files"
find . -name "*.log" -type f -delete 2>/dev/null && echo "✓ Removed log files"

echo
echo "Cleaning IDE files..."
if [ -d ".vscode" ]; then
    rm -rf ".vscode"
    echo "✓ Removed .vscode directory"
fi

if [ -d ".idea" ]; then
    rm -rf ".idea"
    echo "✓ Removed .idea directory"
fi

echo
echo "========================================"
echo "Cleanup completed!"
echo "========================================"
echo
echo "To reinstall dependencies:"
echo "  Frontend: cd frontend && npm ci"
echo "  Backend:  cd backend && mvn clean install"
echo 