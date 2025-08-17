#!/bin/bash

echo "🚀 Starting Production Deployment for Shop Acc Game Platform..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production file with your production configuration."
    echo "You can copy from env.production.template and fill in your values:"
    echo "  cp env.production.template .env.production"
    echo "  # Then edit .env.production with your actual values"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx-proxy/ssl
mkdir -p nginx-proxy/logs
mkdir -p logs/backend
mkdir -p backups
mkdir -p monitoring

# Check SSL certificates
if [ ! -f nginx-proxy/ssl/cert.pem ] || [ ! -f nginx-proxy/ssl/key.pem ]; then
    echo "⚠️  SSL certificates not found in nginx-proxy/ssl/"
    echo "Please place your SSL certificates:"
    echo "  - nginx-proxy/ssl/cert.pem (SSL certificate)"
    echo "  - nginx-proxy/ssl/key.pem (Private key)"
    echo ""
    echo "For testing, you can generate self-signed certificates:"
    echo "  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx-proxy/ssl/key.pem -out nginx-proxy/ssl/cert.pem"
    echo ""
    read -p "Do you want to generate self-signed certificates for testing? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔐 Generating self-signed SSL certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx-proxy/ssl/key.pem \
            -out nginx-proxy/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        echo "✅ Self-signed certificates generated"
    else
        echo "❌ SSL certificates required for production deployment"
        exit 1
    fi
fi

# Set proper permissions for SSL certificates
chmod 600 nginx-proxy/ssl/key.pem
chmod 644 nginx-proxy/ssl/cert.pem

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start production services
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -f -k https://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
fi

if curl -f -k https://localhost/api/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
fi

echo ""
echo "🎉 Production deployment completed!"
echo ""
echo "📱 Access your application:"
echo "  - Frontend: https://localhost"
echo "  - Backend API: https://localhost/api"
echo "  - API Docs: https://localhost/api/swagger-ui.html"
echo ""
echo "🔧 Management interfaces:"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin)"
echo "  - pgAdmin: http://localhost:5050"
echo ""
echo "📊 Monitor logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down" 