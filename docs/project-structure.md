# Project Structure Documentation

## Overview
This document provides a detailed breakdown of the Shop Account Game platform project structure, explaining the function of each file and directory.

## Root Directory Structure

```
shop-acc-game/
├── backend/                    # Spring Boot backend application
├── frontend/                   # React frontend application
├── steam-checker/             # Steam account validation microservice
├── docs/                       # Project documentation
├── backups/                    # Database backup files
├── logs/                       # Application logs
├── monitoring/                 # Monitoring and observability configs
├── nginx-proxy/               # Nginx reverse proxy configuration
├── .env                        # Local environment configuration
├── .env.production             # Production environment configuration (local/testing)
├── docker-compose.cloudflare.yml  # Docker Compose for production deployment
├── docker-compose.yml          # Docker Compose for local/dev services
├── deploy-cloudflare.bat      # Windows deployment script
├── env.production.template    # Environment variables template
├── run-local.bat             # Local development startup script
├── setup-database.bat        # Database setup script
├── start-services.bat        # Service startup script
└── README.md                 # Main project documentation
```

## Backend Structure (`/backend`)

### Main Application
- **`ShopAccGameApplication.java`** - Main Spring Boot application entry point with database connection testing

### Controllers (`/controller/`)
REST API endpoints for handling HTTP requests:

- **`AccountInfoController.java`** - Account information management (CRUD operations)
- **`AdminController.java`** - Admin-only operations and system management
- **`AuthController.java`** - User authentication endpoints (login, register, logout)
- **`CartController.java`** - Shopping cart operations (add, remove, view items)
- **`FileUploadController.java`** - File upload handling for images and documents
- **`GameController.java`** - Game-related operations and information
- **`GameImportController.java`** - Bulk game import functionality
- **`HealthController.java`** - Health check endpoints for monitoring
- **`SepayWebhookController.java`** - Payment webhook processing from SePay.vn
- **`SteamAccountController.java`** - Steam account management (CRUD operations)
- **`SteamAccountControllerNew.java`** - New Steam account management with AccountInfo integration
- **`SteamAccountOrderController.java`** - Order processing for Steam accounts
- **`SteamAccountPublicController.java`** - Public-facing Steam account endpoints
- **`SteamImportController.java`** - Steam games import functionality
- **`UserBalanceController.java`** - User balance and wallet management
- **`WalletDepositController.java`** - Wallet deposit operations and transactions

### Entities (`/entity/`)
JPA entities representing database tables:

- **`AccountInfo.java`** - Account information with pricing, metadata, and game associations
- **`User.java`** - User account information
- **`SteamAccount.java`** - Steam account credentials and status (references AccountInfo)
- **`Game.java`** - Game information and metadata (many-to-many with AccountInfo)
- **`CartItem.java`** - Shopping cart items (references AccountInfo)
- **`SteamAccountOrder.java`** - Steam account order processing (references AccountInfo)
- **`EmailVerification.java`** - Email verification tokens
- **`WalletDeposit.java`** - Wallet deposit transactions
- **`enums/`** - Enumeration types
  - **`AccountStatus.java`** - Steam account status enumeration
  - **`AccountType.java`** - Account type classification

### DTOs (`/dto/`)
Data Transfer Objects for API request/response handling:

- **`AccountInfoDto.java`** - Account information data transfer
- **`AccountInfoRequestDto.java`** - Account information creation/update request
- **`AccountInfoWithSteamAccountsDto.java`** - Account info with associated Steam accounts
- **`AdminOrderDto.java`** - Admin order management data
- **`AuthRequest.java`** - Authentication request data
- **`AuthResponse.java`** - Authentication response data
- **`OAuthRequest.java`** - OAuth authentication request
- **`SteamAccountDto.java`** - Steam account data transfer
- **`SteamAccountRequestDto.java`** - Steam account creation/update request
- **`SteamAccountAdminDto.java`** - Admin-specific Steam account data
- **`OrderRequestDto.java`** - Order creation request
- **`OrderResponseDto.java`** - Order response data
- **`CartItemDto.java`** - Shopping cart item data
- **`GameDto.java`** - Game information transfer
- **`GameRequestDto.java`** - Game creation/update request
- **`GamePageResponseDto.java`** - Paginated game response
- **`RevenueStatsDto.java`** - Revenue statistics data
- **`UserDto.java`** - User data transfer
- **`EmailVerificationRequest.java`** - Email verification request
- **`SendVerificationRequest.java`** - Send verification email request
- **`SepayWebhookDto.java`** - SePay webhook data

### Repositories (`/repository/`)
Spring Data JPA repositories for database operations:

- **`AccountInfoRepository.java`** - Account information data access
- **`UserRepository.java`** - User data access
- **`SteamAccountRepository.java`** - Steam account data access
- **`GameRepository.java`** - Game data access
- **`CartItemRepository.java`** - Cart item data access
- **`SteamAccountOrderRepository.java`** - Steam account order data access
- **`EmailVerificationRepository.java`** - Email verification token data access
- **`WalletDepositRepository.java`** - Wallet deposit transaction data access

### Services (`/service/`)
Business logic layer:

- **`AccountInfoService.java`** - Account information business logic
- **`AdminService.java`** - Admin operations and system management
- **`AuthService.java`** - Authentication and authorization logic
- **`SteamAccountService.java`** - Steam account business logic
- **`SteamAccountServiceNew.java`** - New Steam account service with AccountInfo integration
- **`SteamAccountOrderService.java`** - Steam account order processing
- **`SteamCheckerService.java`** - Steam account validation service
- **`SteamImportService.java`** - Steam games import functionality
- **`EmailService.java`** - Email notification service
- **`GameService.java`** - Game management business logic
- **`GameImportService.java`** - Bulk game import functionality
- **`CartService.java`** - Shopping cart business logic
- **`UserBalanceService.java`** - User balance and wallet management
- **`WalletDepositService.java`** - Wallet deposit processing
- **`EncryptionService.java`** - Data encryption and decryption utilities

### Security (`/security/`)
Authentication and authorization:

- **`JwtAuthenticationFilter.java`** - JWT token validation
- **`JwtUtil.java`** - JWT token generation and validation utilities

### Configuration (`/config/`)
Application configuration classes:

- **`DatabaseConfig.java`** - Database connection configuration
- **`DatabaseHealthIndicator.java`** - Database health monitoring
- **`DatabaseReadinessChecker.java`** - Database readiness checks
- **`EmailConfig.java`** - Email service configuration
- **`GoogleOAuth2Config.java`** - Google OAuth2 configuration
- **`JpaConfig.java`** - JPA/Hibernate configuration
- **`OpenApiConfig.java`** - OpenAPI/Swagger documentation configuration
- **`RestTemplateConfig.java`** - REST client configuration
- **`SecurityConfig.java`** - Spring Security configuration
- **`SimpleEmailConfig.java`** - Simple email configuration
- **`StaticResourceConfig.java`** - Static resource serving configuration

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
- **`MultiSteamAccountForm.jsx`** - Multi-account form component
- **`PaymentDialog.jsx`** - Payment processing dialog
- **`PaymentConfirmationDialog.jsx`** - Payment confirmation dialog
- **`DepositDialog.jsx`** - Wallet deposit dialog
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
- **`logo_square.png`** - Square logo variant
- **`guide_update_steam_account.pdf`** - Guide for updating Steam account
- **`vite.svg`** - Vite logo
- **`uploads/`** - Static uploaded images (bottom, center, left, right banners, game images)

### Build Configuration
- **`package.json`** - Node.js dependencies and scripts
- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`.eslintrc.cjs`** - ESLint configuration
- **`Dockerfile.cloudflare`** - Docker image for Cloudflare deployment
- **`nginx.cloudflare.conf`** - Nginx configuration for Cloudflare

## Steam Checker Microservice (`/steam-checker`)

### Overview
A standalone Node.js microservice for validating Steam account credentials using the steam-user library.

### Main Files
- **`index.js`** - Express.js server with Steam account validation endpoints
- **`package.json`** - Node.js dependencies and scripts
- **`package-lock.json`** - Dependency lock file
- **`Dockerfile.cloudflare`** - Docker image for Cloudflare deployment

### Dependencies
- **`express`** - Web framework for API endpoints
- **`cors`** - Cross-origin resource sharing middleware
- **`steam-user`** - Steam client library for account validation

### API Endpoints
- **`POST /check`** - Validates Steam account credentials
  - Request: `{ username, password, twoFactorCode? }`
  - Response: `{ valid: boolean, error?: string }`

### Features
- Steam account login validation
- Steam Guard (2FA) detection
- Error handling for invalid credentials
- Automatic connection cleanup
- CORS support for cross-origin requests

### Integration
- Called by `SteamCheckerService` in the main backend
- Runs on port 4000 by default
- Used for validating Steam accounts before sale

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
- **`.env`** - Local development environment variables
- **`.env.production`** - Production environment variables (local/testing)
- **`env.production.template`** - Template for production environment variables

## Database Structure

### Core Tables
- **`account_info`** - Account information with pricing, metadata, and game associations
- **`users`** - User accounts and authentication
- **`steam_accounts`** - Steam account credentials and status (references account_info)
- **`games`** - Game information and metadata
- **`account_games`** - Many-to-many relationship between account_info and games
- **`steam_account_orders`** - Steam account order processing (references account_info)
- **`cart_items`** - Shopping cart items (references account_info)
- **`email_verifications`** - Email verification tokens
- **`wallet_deposits`** - Wallet deposit transactions

### Migration Scripts
Located in `backend/src/main/resources/db/migration/` for database schema versioning:
- **`V20241225_001__Add_Steam_Fields_To_Games.sql`** - Added Steam-related fields to games table
- **`V20241225_002__Split_SteamAccount_To_AccountInfo_And_SteamAccount.sql`** - Split SteamAccount into AccountInfo and SteamAccount entities

## Entity Relationships

### Core Entity Structure
The application follows a three-tier entity relationship model:

1. **AccountInfo** (Top Level)
   - Contains account metadata (name, description, image, pricing, discount)
   - Defines account type (PREMIUM, STANDARD, etc.)
   - Has many-to-many relationship with Games
   - Has one-to-many relationship with SteamAccounts

2. **SteamAccount** (Middle Level)
   - Contains actual Steam account credentials (username, password, steam guard)
   - References AccountInfo for metadata and pricing
   - Has account status (AVAILABLE, SOLD, PRE_ORDER, etc.)
   - Used in orders and cart items

3. **Game** (Reference Level)
   - Contains game information (name, description, Steam App ID)
   - Has many-to-many relationship with AccountInfo
   - Used to categorize and filter accounts

### Relationship Flow
- **AccountInfo** ↔ **Game**: Many-to-many (accounts can have multiple games, games can be in multiple accounts)
- **AccountInfo** → **SteamAccount**: One-to-many (one account info can have multiple steam accounts)
- **SteamAccount** → **SteamAccountOrder**: One-to-many (steam accounts can be ordered multiple times)
- **AccountInfo** → **CartItem**: One-to-many (account info can be added to cart multiple times)
- **User** → **SteamAccountOrder**: One-to-many (users can have multiple orders)
- **User** → **CartItem**: One-to-many (users can have multiple cart items)

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
- Account information management with pricing and metadata
- Steam account listings with validation
- Game information integration (RAWG API)
- Many-to-many relationship between accounts and games
- Image upload and management
- Inventory tracking with stock management
- Steam account credential validation via microservice
- Discount and pricing management at account level

### User Management
- User registration and profiles
- Order history tracking
- Admin user management
- Email verification system

### Wallet and Balance System
- User wallet management
- Balance tracking and transactions
- Deposit processing
- Payment integration with SePay.vn

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
