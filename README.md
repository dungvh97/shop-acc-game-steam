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
├── frontend/                # React application (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── index.html          # Main HTML file
├── docker-compose.yml       # Database and pgAdmin services
├── start.bat               # Windows startup script
├── start.sh                # Linux/Mac startup script
├── start-production.bat    # Production startup script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- Maven

### 1. Clone and Setup
```bash
git clone <repository-url>
cd shop-acc-game
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Start Backend
```bash
cd backend
mvn spring-boot:run
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/swagger-ui.html
- **Database Admin**: http://localhost:5050 (pgAdmin)

### Alternative: Use Startup Scripts
- **Windows**: Run `start.bat`
- **Linux/Mac**: Run `./start.sh`

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
Create `backend/application-local.yml` for local development:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shopaccgame
    username: postgres
    password: postgres

google:
  oauth2:
    client-id: YOUR_GOOGLE_CLIENT_ID
    client-secret: YOUR_GOOGLE_CLIENT_SECRET

jwt:
  secret: YOUR_JWT_SECRET_KEY
  expiration: 86400000
```

#### Frontend Configuration
Create environment files in the `frontend` directory:

**Development** (`.env.development`):
```env
VITE_BACKEND_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
NODE_ENV=development
```

**Production** (`.env.production`):
```env
VITE_BACKEND_URL=https://api.gurroshop.com
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
NODE_ENV=production
```

## 🔐 Authentication Setup

### Google OAuth2 Configuration

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API and Google Identity API

2. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information
   - Add scopes: `openid`, `email`, `profile`
   - Add test users

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production domain
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret

4. **Update Configuration**:
   - Add credentials to backend `application.yml`
   - Add Client ID to frontend environment files

## 💳 Payment Integration (SePay.vn)

### Webhook Configuration

The application integrates with SePay.vn for automatic payment processing:

**Webhook Endpoint**: `POST https://api.gurroshop.com/api/sepay/webhook`

**Configure in SePay Dashboard**:
1. Go to **WebHooks** menu
2. Click **+ Thêm webhooks**
3. Set **Gọi đến URL**: `https://api.gurroshop.com/api/sepay/webhook`
4. Choose **Sự kiện**: `Có tiền vào` (incoming money only)
5. Set **Request Content type**: `application/json`

**Order ID Recognition**:
- Configure SePay to recognize order ID format (`ORD` + timestamp)
- System extracts order ID from `code` field or `content` field
- Automatically marks orders as paid and releases account credentials

### Testing Webhook

**Health Check**:
```bash
GET https://api.gurroshop.com/api/sepay/webhook/health
```

**Test Payment**:
```bash
curl -X POST https://api.gurroshop.com/api/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": 92704,
    "gateway": "Vietcombank",
    "transactionDate": "2023-03-25 14:02:37",
    "accountNumber": "0123499999",
    "code": "ORD17551068389536956",
    "content": "chuyen tien mua steam account",
    "transferType": "in",
    "transferAmount": 500000,
    "accumulated": 19077000,
    "subAccount": null,
    "referenceCode": "MBVCB.3278907687",
    "description": "Chuyen tien mua steam account ORD17551068389536956"
  }'
```

## 🏗 Development

### Backend Development
- Spring Boot 3.2.0 with Java 17
- JPA/Hibernate for database operations
- Spring Security with JWT for authentication
- OpenAPI/Swagger for API documentation
- SePay webhook integration for payments

### Frontend Development
- **Vite** for fast development and building
- **React 18** with functional components and hooks
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Axios** for API communication
- **Google OAuth2** for authentication

### Database
- PostgreSQL 14 with Docker
- pgAdmin for database management
- Automatic schema creation on startup

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Steam Accounts
- `GET /api/steam-accounts` - Get all steam accounts
- `GET /api/steam-accounts/{id}` - Get steam account by ID
- `POST /api/steam-accounts` - Create steam account (admin only)
- `PUT /api/steam-accounts/{id}` - Update steam account (admin only)
- `DELETE /api/steam-accounts/{id}` - Delete steam account (admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/user/{userId}` - Get user orders

### Payment
- `POST /api/sepay/webhook` - SePay webhook endpoint
- `GET /api/sepay/webhook/health` - Webhook health check

## 🚀 Production Deployment

### Build for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
```bash
cd backend
mvn clean package
```

### Environment Setup

1. **Create production environment files**
2. **Configure database connection**
3. **Set up Google OAuth credentials**
4. **Configure SePay webhook URL**
5. **Set JWT secret key**

### Deployment Checklist

- [ ] Created `.env.production` file
- [ ] Built frontend with `npm run build`
- [ ] Built backend with `mvn clean package`
- [ ] Configured production database
- [ ] Set up Google OAuth for production domain
- [ ] Configured SePay webhook for production
- [ ] Set up SSL certificates
- [ ] Configured reverse proxy (nginx/apache)
- [ ] Set up monitoring and logging

## 👥 Default Accounts

### Admin Account
- **Username**: admin
- **Password**: admin123

### Test User Account
- **Username**: user
- **Password**: user123

## 🐛 Troubleshooting

### Common Issues

1. **CORS Issues**: Ensure backend allows requests from frontend domain
2. **Database Connection**: Check PostgreSQL is running and accessible
3. **Google OAuth**: Verify Client ID and authorized origins
4. **Payment Webhook**: Check webhook URL and SePay configuration
5. **Build Issues**: Clear cache and rebuild

### Logs

**Backend Logs**:
```bash
tail -f backend/logs/application.log
```

**Frontend Build**:
```bash
cd frontend
npm run build
```

### Health Checks

- **Backend**: `http://localhost:8080/api/health`
- **Database**: `http://localhost:5050` (pgAdmin)
- **Webhook**: `https://api.gurroshop.com/api/sepay/webhook/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Note**: This is a production-ready application with payment integration, OAuth authentication, and comprehensive admin features. Make sure to properly configure all environment variables and external services before deployment.
