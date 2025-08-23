# 🚀 Local Development Setup - Shop Acc Game

This guide will help you set up and run the Shop Acc Game project locally without Docker for the application, but using Docker for the database.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Java 17 or higher** - [Download OpenJDK](https://adoptium.net/)
- **Maven 3.6+** - [Download Maven](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Docker Desktop** - [Download Docker](https://www.docker.com/products/docker-desktop/)

### Verify Installation
```bash
java -version    # Should show Java 17+
mvn -version     # Should show Maven 3.6+
node -v          # Should show Node.js 18+
docker --version # Should show Docker version
```

## 🗄️ Database Setup

### Option 1: Use the Setup Script (Recommended)
1. **Start Docker Desktop** and ensure it's running
2. **Double-click `setup-database.bat`**
3. **Choose option 2** to start a new PostgreSQL container
4. The script will create a `docker-compose.yml` file and start PostgreSQL

### Option 2: Use Existing Docker Database
1. **Start Docker Desktop** and ensure it's running
2. **Double-click `setup-database.bat`**
3. **Choose option 1** to use existing container
4. Ensure your container is running on `localhost:5432`

### Option 3: Manual Docker Setup
```bash
# Create docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: shop_acc_game_postgres
    environment:
      POSTGRES_DB: shop_acc_game
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: shopaccgame2024!
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
volumes:
  postgres_data:

# Start the container
docker-compose up -d postgres
```

## 🧪 Testing Database Connection

Before starting the application, you can test the database connection:

**Double-click `test-db-connection.bat`**
- This script will test the connection to your Docker PostgreSQL
- Shows connection details and status
- Helps identify database issues before starting the backend

## 🚀 Running the Application

### First Time Setup
1. **Ensure Docker PostgreSQL is running**
2. **Double-click `run-local.bat`**
   - This script will:
     - Check all prerequisites
     - Create frontend environment file
     - Start both backend and frontend
     - Open the application in your browser

### Subsequent Runs
1. **Ensure Docker PostgreSQL is running**
2. **Run `start-services.bat`** - Quick start

### Troubleshooting Database Issues
1. **Run `test-db-connection.bat`** to verify database connectivity
2. **Run `setup-database.bat`** if the database isn't running
3. **Check Docker status** with `docker ps`

## 📁 Project Structure

```
shop-acc-game/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files (application.yml)
│   └── pom.xml            # Maven dependencies
├── frontend/               # React + Vite application
│   ├── src/               # React source code
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── run-local.bat          # First-time setup script
├── start-services.bat     # Quick start script
├── setup-database.bat     # Docker database setup script
├── test-db-connection.bat # Database connection test script
├── docker-compose.yml     # Docker database configuration
└── LOCAL-SETUP.md         # This file
```

## 🌐 Access Points

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **Health Check**: http://localhost:8080/api/actuator/health

## ⚙️ Environment Configuration

### Backend Configuration
The backend uses `backend/src/main/resources/application.yml` with these default values:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shop_acc_game
    username: postgres
    password: shopaccgame2024!
    driver-class-name: org.postgresql.Driver
```

**No .env file needed** - Spring Boot will use these default values.

### Frontend (.env.local file)
The script automatically creates `frontend/.env.local` with:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=915027856276-41dpec5j8s73178jkiojn5nd15pb5sh5.apps.googleusercontent.com
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Java Version Error
```
ERROR: Java is not installed or not in PATH
```
**Solution**: Install Java 17+ and add to PATH

#### 2. Maven Not Found
```
ERROR: Maven is not installed or not in PATH
```
**Solution**: Install Maven and add to PATH

#### 3. Node.js Not Found
```
ERROR: Node.js is not installed or not in PATH
```
**Solution**: Install Node.js 18+ and add to PATH

#### 4. Docker Not Running
```
ERROR: Docker is not installed or not running
```
**Solutions**:
- Install Docker Desktop
- Start Docker Desktop
- Ensure Docker service is running

#### 5. Database Connection Failed
```
ERROR: Could not connect to database
```
**Solutions**:
- **First**: Run `test-db-connection.bat` to diagnose the issue
- Ensure Docker is running
- Check if PostgreSQL container is running: `docker ps`
- Verify container is on port 5432
- Run `setup-database.bat` to start container
- **Important**: The backend uses default password `shopaccgame2024!` from `application.yml`

#### 6. Port Already in Use
```
Port 8080 or 3000 is already in use
```
**Solutions**:
- Stop other services using the ports
- Change backend port in `backend/src/main/resources/application.yml`
- Change frontend port in `start-services.bat`

### Manual Commands

If the batch files don't work, you can run manually:

#### Start Database
```bash
docker-compose up -d postgres
```

#### Backend
```bash
cd backend
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3000
```

## 📝 Development Notes

- **Backend**: Spring Boot with JPA, Security, and JWT
- **Frontend**: React 18 with Vite, Tailwind CSS, and Radix UI
- **Database**: PostgreSQL in Docker (same as production)
- **Authentication**: Google OAuth2 + JWT tokens
- **File Upload**: Local storage in `./uploads` directory
- **Ports**: Backend 8080, Frontend 3000
- **Configuration**: Backend uses `application.yml` defaults, no .env needed

## 🆘 Getting Help

If you encounter issues:

1. **Run `test-db-connection.bat`** to check database connectivity
2. Check the console windows for error messages
3. Verify all prerequisites are installed
4. Ensure Docker is running and PostgreSQL container is active
5. Check that ports 8080 and 3000 are available
6. Review the troubleshooting section above
7. Check Docker container status: `docker ps`
8. **Verify database password**: The backend uses `shopaccgame2024!` by default

## 🎉 Success!

Once everything is running:
- Frontend will be available at http://localhost:3000
- Backend API will be available at http://localhost:8080/api
- Database will be running in Docker (same as production)
- You can start developing and testing features

Happy coding! 🚀 