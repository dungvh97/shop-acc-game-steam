# Project Maintenance Guide

This guide explains how to keep your shop-acc-game project clean and organized.

## Quick Cleanup

### Windows
```bash
cleanup.bat
```

### Unix/Linux/macOS
```bash
./cleanup.sh
```

## Manual Cleanup Steps

### 1. Frontend Cleanup
```bash
cd frontend
rm -rf dist/          # Remove build output
rm -rf node_modules/  # Remove dependencies (reinstall with npm ci)
```

### 2. Backend Cleanup
```bash
cd backend
mvn clean            # Clean Maven build artifacts
rm -rf target/       # Remove build output
```

### 3. General Cleanup
```bash
# Remove logs
rm -rf logs/

# Remove IDE files
rm -rf .vscode/
rm -rf .idea/

# Remove temporary files
find . -name "*.tmp" -type f -delete
find . -name "*.log" -type f -delete
```

## What Gets Ignored by Git

The `.gitignore` file is configured to ignore:

- **Build artifacts**: `dist/`, `build/`, `target/`
- **Dependencies**: `node_modules/`, `.mvn/`
- **Environment files**: `.env*`
- **Logs**: `logs/`, `*.log`
- **IDE files**: `.vscode/`, `.idea/`
- **Cache files**: `.cache/`, `.eslintcache`
- **Temporary files**: `*.tmp`, `*.bak`
- **Uploads**: `backend/uploads/`, `frontend/public/uploads/` (except `.gitkeep`)

## Before Committing

1. **Run cleanup script** to remove build artifacts
2. **Check for sensitive files** (API keys, passwords)
3. **Verify no large files** are being committed
4. **Test the build** after cleanup

## Dependency Management

### Frontend
```bash
cd frontend
npm ci              # Clean install (faster than npm install)
npm run build       # Build for production
npm run dev         # Development server
```

### Backend
```bash
cd backend
mvn clean install   # Clean build and install
mvn spring-boot:run # Run development server
```

## Environment Configuration

- **Never commit** `.env` files
- Use `.env.template` files for configuration examples
- Set up environment variables in your deployment platform
- Use different configurations for development, staging, and production

## Monitoring and Logs

- Logs are automatically ignored by git
- Use proper logging levels in your application
- Consider log rotation for production environments
- Monitor log sizes to prevent disk space issues

## Security Best Practices

- Keep API keys and secrets out of version control
- Use environment variables for sensitive configuration
- Regularly update dependencies for security patches
- Review `.gitignore` to ensure no sensitive files are tracked

## Troubleshooting

### Build Issues After Cleanup
1. Reinstall dependencies: `npm ci` (frontend) or `mvn clean install` (backend)
2. Clear cache: `npm cache clean --force` or `mvn clean`
3. Check for missing environment variables

### Large Repository Size
1. Check for large files: `git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3nr | head -10`
2. Remove large files from git history if needed
3. Ensure `.gitignore` is properly configured

## Regular Maintenance Schedule

- **Weekly**: Run cleanup scripts
- **Monthly**: Review and update dependencies
- **Quarterly**: Audit `.gitignore` and security settings
- **Before releases**: Full cleanup and dependency audit 