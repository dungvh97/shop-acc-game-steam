# Game Account Shop Platform

A full-stack web application for selling game accounts, similar to KAMIKEY. Built with Spring Boot backend and React frontend using Vite.

## 🚀 Features

- **User Authentication**: JWT-based authentication with Google OAuth2 integration
- **Product Management**: Browse and search game accounts with detailed information
- **Payment Integration**: SePay.vn webhook integration for automatic payment processing
- **User Profiles**: View and edit user information, order history
- **Admin Panel**: Manage products, users, and system settings (admin role required)
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components
- **Real-time Order Tracking**: Automatic order status updates via webhooks

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL
- **Security**: Spring Security with JWT
- **Documentation**: OpenAPI/Swagger
- **Payment**: SePay.vn webhook integration

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite (fast development and build)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Authentication**: Google OAuth2

## 📁 Project Structure

```
shop-acc-game/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/shopaccgame/
│   │       ├── config/      # Configuration classes
│   │       ├── controller/  # REST controllers
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── entity/      # JPA entities
│   │       ├── repository/  # Spring Data repositories
│   │       ├── security/    # JWT and security classes
│   │       └── service/     # Business logic services
│   ├── src/main/resources/
│   │   └── application.yml  # Application configuration
│   └── uploads/             # File uploads (images)
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utilities and configurations
│   │   └── pages/          # Page components
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── monitoring/             # Grafana & Prometheus configs
├── nginx-proxy/           # Nginx configurations
├── docker-compose.cloudflare.yml  # Cloudflare deployment
├── env.production.template        # Environment template
└── deploy-cloudflare.bat         # Deployment script
```

## ⚡ Quick Start (Windows)

### Prerequisites
- **Docker Desktop** for Windows
- **Git** for Windows
- **Java 17** (for local development)
- **Node.js 18+** (for local development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/shop-acc-game.git
cd shop-acc-game
```

### 2. Setup Environment
```bash
# Copy environment template
copy env.production.template .env.production

# Edit .env.production with your actual values
notepad .env.production
```

### 3. Deploy to Cloudflare
```bash
deploy-cloudflare.bat
```

That's it! Your application will be deployed and accessible at:
- **Frontend**: https://gurroshop.com (via Cloudflare)
- **Backend API**: https://api.gurroshop.com (via Cloudflare)

## 🔧 Configuration

### Environment Variables (.env.production)

```env
# Database Configuration
POSTGRES_DB=shop_acc_game
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# pgAdmin Configuration
PGADMIN_EMAIL=admin@gurroshop.com
PGADMIN_PASSWORD=admin_password

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# Email Configuration
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# RAWG API Configuration
RAWG_API_KEY=your_rawg_api_key

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend Configuration
VITE_BACKEND_URL=https://api.gurroshop.com

# Monitoring Configuration
GRAFANA_PASSWORD=admin

# Security Settings
NODE_ENV=production
SPRING_PROFILES_ACTIVE=production
```

## 🔐 Authentication Setup

### Google OAuth2 Configuration

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API and Google Identity API

2. **Configure OAuth Consent Screen**:
   - Choose "External" user type
   - Fill in required information
   - Add scopes: `openid`, `email`, `profile`

3. **Create OAuth 2.0 Credentials**:
   - Choose "Web application"
   - Add authorized JavaScript origins: `https://gurroshop.com`
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret to `.env.production`

## 💳 Payment Integration (SePay.vn)

### Webhook Configuration

**Webhook Endpoint**: `POST https://api.gurroshop.com/api/sepay/webhook`

**Configure in SePay Dashboard**:
1. Go to **WebHooks** menu
2. Click **+ Thêm webhooks**
3. Set **Gọi đến URL**: `https://api.gurroshop.com/api/sepay/webhook`
4. Choose **Sự kiện**: `Có tiền vào` (incoming money only)
5. Set **Request Content type**: `application/json`

## 📡 Management Interfaces

After deployment, access these interfaces locally:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **pgAdmin**: http://localhost:5050
- **API Documentation**: https://api.gurroshop.com/api/swagger-ui.html

## 🔍 Monitoring

### View Services
```bash
docker-compose -f docker-compose.cloudflare.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.cloudflare.yml logs -f

# Specific service
docker-compose -f docker-compose.cloudflare.yml logs -f frontend
docker-compose -f docker-compose.cloudflare.yml logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.cloudflare.yml restart

# Rebuild and restart
docker-compose -f docker-compose.cloudflare.yml up --build -d
```

## 🛠 Maintenance

### Clean Build Artifacts
```bash
cleanup.bat
```

### Redeploy
```bash
deploy-cloudflare.bat
```

### Local Development (Optional)

**Frontend**:
```bash
cd frontend
npm ci
npm run dev
```

**Backend**:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## 👥 Default Accounts

### Admin Account
- **Username**: admin
- **Password**: admin123

### Test User Account
- **Username**: user
- **Password**: user123

## 🐛 Troubleshooting

### Common Issues

1. **Docker Issues**: Ensure Docker Desktop is running
2. **Environment Issues**: Check `.env.production` file exists and is properly configured
3. **Network Issues**: Verify Cloudflare configuration and domain settings
4. **Build Issues**: Run `cleanup.bat` and redeploy

### Health Checks

- **Backend**: https://api.gurroshop.com/api/health
- **Webhook**: https://api.gurroshop.com/api/sepay/webhook/health
- **API Docs**: https://api.gurroshop.com/api/swagger-ui.html

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the [MAINTENANCE.md](MAINTENANCE.md) guide
- Review the API documentation
- Check Docker logs for error messages

---

**Note**: This is a production-ready application optimized for Cloudflare deployment on Windows. Make sure to properly configure all environment variables and external services before deployment.
