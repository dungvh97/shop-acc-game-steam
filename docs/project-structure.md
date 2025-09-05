# Project Structure Documentation

## Overview
This document provides a detailed breakdown of the Shop Account Game platform project structure, explaining the function of each file and directory.

## Root Directory Structure

```
shop-acc-game/
├── backend/                    # Spring Boot backend application
├── frontend/                   # React frontend application
├── docs/                       # Project documentation
├── backups/                    # Database backup files
├── logs/                       # Application logs
├── monitoring/                 # Monitoring and observability configs
├── nginx-proxy/               # Nginx reverse proxy configuration
├── docker-compose.cloudflare.yml  # Docker Compose for production deployment
├── deploy-cloudflare.bat      # Windows deployment script
├── env.production.template    # Environment variables template
├── run-local.bat             # Local development startup script
├── setup-database.bat        # Database setup script
├── start-services.bat        # Service startup script
├── LOCAL-SETUP.md            # Local development setup guide
└── README.md                 # Main project documentation
```

## Backend Structure (`/backend`)

### Main Application
- **`ShopAccGameApplication.java`** - Main Spring Boot application entry point with database connection testing

### Controllers (`/controller/`)
REST API endpoints for handling HTTP requests:

- **`AuthController.java`** - User authentication endpoints (login, register, logout)
- **`AdminController.java`** - Admin-only operations and system management
- **`CartController.java`** - Shopping cart operations (add, remove, view items)
- **`FileUploadController.java`** - File upload handling for images and documents
- **`GameController.java`** - Game-related operations and information
- **`GameImportController.java`** - Bulk game import functionality
- **`HealthController.java`** - Health check endpoints for monitoring
- **`SepayWebhookController.java`** - Payment webhook processing from SePay.vn
- **`SteamAccountController.java`** - Steam account management (CRUD operations)
- **`SteamAccountOrderController.java`** - Order processing for Steam accounts
- **`SteamAccountPublicController.java`** - Public-facing Steam account endpoints

### Entities (`/entity/`)
JPA entities representing database tables:

- **`User.java`** - User account information
- **`SteamAccount.java`** - Steam account product details
- **`Game.java`** - Game information and metadata
- **`Order.java`** - Order records and status
- **`CartItem.java`** - Shopping cart items
- **`Payment.java`** - Payment transaction records

### DTOs (`/dto/`)
Data Transfer Objects for API request/response handling:

- **`LoginRequest.java`** - Login credentials
- **`RegisterRequest.java`** - User registration data
- **`SteamAccountDto.java`** - Steam account data transfer
- **`OrderDto.java`** - Order information transfer
- **`PaymentDto.java`** - Payment data transfer

### Repositories (`/repository/`)
Spring Data JPA repositories for database operations:

- **`UserRepository.java`** - User data access
- **`SteamAccountRepository.java`** - Steam account data access
- **`GameRepository.java`** - Game data access
- **`OrderRepository.java`** - Order data access
- **`CartItemRepository.java`** - Cart item data access

### Services (`/service/`)
Business logic layer:

- **`UserService.java`** - User management business logic
- **`SteamAccountService.java`** - Steam account business logic
- **`OrderService.java`** - Order processing logic
- **`PaymentService.java`** - Payment processing logic
- **`EmailService.java`** - Email notification service
- **`FileService.java`** - File upload and management

### Security (`/security/`)
Authentication and authorization:

- **`JwtAuthenticationFilter.java`** - JWT token validation
- **`JwtTokenProvider.java`** - JWT token generation and validation
- **`SecurityConfig.java`** - Spring Security configuration
- **`UserDetailsServiceImpl.java`** - Custom user details service

### Configuration (`/config/`)
Application configuration classes:

- **`DatabaseConfig.java`** - Database connection configuration
- **`WebConfig.java`** - Web application configuration
- **`CorsConfig.java`** - Cross-origin resource sharing setup

### Resources (`/src/main/resources/`)
- **`application.yml`** - Spring Boot application configuration
- **`db/migration/`** - Database migration scripts (Flyway)

### Build and Deployment
- **`Dockerfile.cloudflare`** - Docker image for Cloudflare deployment
- **`pom.xml`** - Maven project configuration and dependencies

### Uploads (`/uploads/`)
- **`games/`** - Game-related images and files
- **`steam-accounts/`** - Steam account images and screenshots

## Frontend Structure (`/frontend`)

### Main Application Files
- **`main.jsx`** - React application entry point
- **`App.jsx`** - Main application component with routing
- **`index.css`** - Global CSS styles

### Pages (`/pages/`)
Main application views:

- **`Home.jsx`** - Landing page with featured content
- **`Login.jsx`** - User login page with Google OAuth
- **`Register.jsx`** - User registration page
- **`Profile.jsx`** - User profile management
- **`Admin.jsx`** - Admin dashboard and management
- **`Cart.jsx`** - Shopping cart view
- **`GameDetail.jsx`** - Individual game details
- **`SteamAccounts.jsx`** - Steam accounts listing and filtering
- **`SteamAccountDetail.jsx`** - Individual Steam account details

### Components (`/components/`)
Reusable UI components:

- **`Navbar.jsx`** - Main navigation bar
- **`MobileNav.jsx`** - Mobile navigation menu
- **`Footer.jsx`** - Application footer
- **`Breadcrumbs.jsx`** - Navigation breadcrumbs
- **`GameSlideshow.jsx`** - Game image slideshow
- **`SteamAccountManager.jsx`** - Steam account management interface
- **`PaymentDialog.jsx`** - Payment processing dialog
- **`AccountCredentialsModal.jsx`** - Account credentials display modal

### UI Components (`/components/ui/`)
Reusable UI primitives (Radix UI based):

- **`avatar.jsx`** - User avatar component
- **`badge.jsx`** - Status and label badges
- **`button.jsx`** - Button components
- **`card.jsx`** - Card layout components
- **`input.jsx`** - Form input components
- **`select.jsx`** - Dropdown select components
- **`separator.jsx`** - Visual separators
- **`tabs.jsx`** - Tab navigation components
- **`toast.jsx`** - Toast notification components
- **`toaster.jsx`** - Toast notification manager

### Contexts (`/contexts/`)
React context providers for state management:

- **`AuthContext.jsx`** - Authentication state management
- **`CartContext.jsx`** - Shopping cart state management

### Hooks (`/hooks/`)
Custom React hooks:

- **`use-toast.js`** - Toast notification hook

### Libraries (`/lib/`)
Utility libraries and configurations:

- **`api.js`** - API client configuration and methods
- **`config.js`** - Application configuration
- **`utils.js`** - General utility functions

### Utilities (`/utils/`)
Helper functions:

- **`encoding.js`** - Data encoding utilities
- **`imageUtils.js`** - Image processing utilities

### Public Assets (`/public/`)
Static files:

- **`logo.png`** - Application logo
- **`vite.svg`** - Vite logo
- **`uploads/`** - Static uploaded images (bottom, center, left, right banners, game images)

### Build Configuration
- **`package.json`** - Node.js dependencies and scripts
- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`Dockerfile.cloudflare`** - Docker image for Cloudflare deployment
- **`nginx.cloudflare.conf`** - Nginx configuration for Cloudflare

## Infrastructure and Deployment

### Docker Configuration
- **`docker-compose.cloudflare.yml`** - Production deployment with all services
  - PostgreSQL database
  - pgAdmin for database management
  - Spring Boot backend
  - React frontend
  - Prometheus monitoring
  - Grafana dashboards

### Monitoring (`/monitoring/`)
- **`prometheus.yml`** - Prometheus metrics collection configuration
- **`grafana/`** - Grafana dashboard configurations
  - **`provisioning/dashboards/dashboard.yml`** - Dashboard provisioning
  - **`provisioning/datasources/prometheus.yml`** - Data source configuration

### Nginx Proxy (`/nginx-proxy/`)
- **`nginx.conf`** - Reverse proxy configuration
- **`logs/`** - Nginx access and error logs
- **`ssl/`** - SSL certificate storage

### Scripts
- **`deploy-cloudflare.bat`** - Windows batch script for Cloudflare deployment
- **`run-local.bat`** - Local development startup script
- **`setup-database.bat`** - Database initialization script
- **`start-services.bat`** - Service startup script

### Environment Configuration
- **`env.production.template`** - Template for production environment variables
- **`LOCAL-SETUP.md`** - Local development setup instructions

## Database Structure

### Core Tables
- **`users`** - User accounts and authentication
- **`steam_accounts`** - Steam account products
- **`games`** - Game information and metadata
- **`orders`** - Order records and status
- **`cart_items`** - Shopping cart items
- **`payments`** - Payment transaction records

### Migration Scripts
Located in `backend/src/main/resources/db/migration/` for database schema versioning

## Key Features by Component

### Authentication System
- JWT-based authentication
- Google OAuth2 integration
- Role-based access control (User/Admin)

### Payment Integration
- SePay.vn webhook processing
- Automatic order status updates
- Payment verification and confirmation

### Product Management
- Steam account listings
- Game information integration (RAWG API)
- Image upload and management
- Inventory tracking

### User Management
- User registration and profiles
- Order history tracking
- Admin user management

### Monitoring and Observability
- Prometheus metrics collection
- Grafana dashboards
- Health check endpoints
- Application logging

## Development Workflow

### Local Development
1. Use `run-local.bat` for local development
2. Frontend runs on `http://localhost:3000`
3. Backend runs on `http://localhost:8080`
4. Database accessible via pgAdmin on `http://localhost:5050`

### Production Deployment
1. Configure `.env.production` from template
2. Run `deploy-cloudflare.bat` for deployment
3. Access via Cloudflare tunnel
4. Monitor via Grafana dashboards

## Security Considerations

### Backend Security
- JWT token validation
- Spring Security configuration
- CORS policy enforcement
- Input validation and sanitization

### Frontend Security
- Environment variable protection
- HTTPS enforcement
- XSS prevention
- CSRF protection

### Infrastructure Security
- Database access restrictions
- Container isolation
- Network segmentation
- SSL/TLS encryption
