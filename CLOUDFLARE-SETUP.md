# 🌩️ Cloudflare + Docker Integration Guide

This guide helps you deploy your Shop Acc Game Platform with Cloudflare for optimal performance, security, and reliability.

## 🏗️ Architecture Overview

```
Internet → Cloudflare CDN/Proxy → Your Server → Docker Containers
         (SSL, DDoS, Cache)      (nginx + apps)   (frontend + backend)
```

## 📋 Prerequisites

- ✅ Domain registered with Cloudflare DNS
- ✅ Docker and Docker Compose installed
- ✅ Server with ports 80, 8080, 3000 accessible
- ✅ `.env.production` file configured

## 🚀 Quick Start

### 1. Deploy Docker Services

```bash
# Windows
deploy-cloudflare.bat

# Linux/Mac (create similar .sh script)
docker-compose -f docker-compose.cloudflare.yml up --build -d
```

### 2. Configure Cloudflare DNS

**A Records:**
```
Type: A
Name: @
Content: YOUR_SERVER_IP
TTL: Auto

Type: A  
Name: api
Content: YOUR_SERVER_IP
TTL: Auto
```

**CNAME Records (Alternative):**
```
Type: CNAME
Name: www
Content: gurroshop.com
TTL: Auto
```

## 🔧 Cloudflare Settings

### SSL/TLS Settings
- **SSL/TLS encryption mode**: `Full (strict)` or `Full`
- **Edge Certificates**: Auto HTTPS Rewrites ON
- **Always Use HTTPS**: ON

### Speed Settings
- **Auto Minify**: CSS, JavaScript, HTML ON
- **Brotli**: ON
- **Rocket Loader**: ON (test first)
- **Mirage**: ON
- **Polish**: Lossless

### Security Settings
- **Security Level**: Medium/High
- **Bot Fight Mode**: ON
- **Browser Integrity Check**: ON
- **Challenge Passage**: 30 minutes

### Firewall Rules (Optional)
```
# Block non-API requests to api subdomain static files
(http.host eq "api.gurroshop.com" and not http.request.uri.path starts_with "/api/")
Action: Block
```

## 🌐 Integration Options

### Option 1: Direct IP Pointing (Simple)

1. **Point DNS to your server IP**
2. **Configure server firewall**:
   ```bash
   # Allow HTTP/HTTPS
   ufw allow 80
   ufw allow 443
   ufw allow 8080  # Backend direct access
   ufw allow 3000  # Frontend direct access
   ```

3. **Cloudflare will proxy all traffic**

### Option 2: Cloudflare Tunnel (Recommended)

1. **Install cloudflared on your server**:
   ```bash
   # Ubuntu/Debian
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate cloudflared**:
   ```bash
   cloudflared tunnel login
   ```

3. **Create tunnel**:
   ```bash
   cloudflared tunnel create shop-acc-game
   ```

4. **Configure tunnel** (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: shop-acc-game
   credentials-file: /home/user/.cloudflared/UUID.json
   
   ingress:
     - hostname: gurroshop.com
       service: http://localhost:3000
     - hostname: api.gurroshop.com  
       service: http://localhost:8080
     - service: http_status:404
   ```

5. **Run tunnel**:
   ```bash
   cloudflared tunnel run shop-acc-game
   ```

## 🔍 Verification Steps

### 1. Check Docker Services
```bash
docker-compose -f docker-compose.cloudflare.yml ps
```

### 2. Test Local Access
```bash
curl http://localhost:3000/health
curl http://localhost:8080/api/actuator/health
```

### 3. Test Through Cloudflare
```bash
curl https://gurroshop.com/health
curl https://api.gurroshop.com/api/actuator/health
```

### 4. Check Cloudflare Headers
```bash
curl -I https://gurroshop.com
# Should see: cf-ray, cf-cache-status headers
```

## 🛡️ Security Configuration

### Backend Spring Boot (application.yml)
```yaml
server:
  forward-headers-strategy: framework
  use-forward-headers: true
  
management:
  server:
    port: 8081  # Different port for actuator
  endpoints:
    web:
      exposure:
        include: health,prometheus
```

### Frontend Environment
```bash
VITE_BACKEND_URL=https://api.gurroshop.com
```

## 📊 Monitoring

### Cloudflare Analytics
- **Traffic**: Monitor requests, bandwidth
- **Security**: View threats blocked
- **Performance**: Check cache hit ratio

### Application Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Application logs**: `docker-compose logs -f`

## 🚨 Troubleshooting

### Common Issues

**1. 522 Connection Timed Out**
- Check if Docker containers are running
- Verify firewall allows connections
- Ensure correct ports are exposed

**2. 525 SSL Handshake Failed**  
- Set Cloudflare SSL mode to "Full" not "Full (strict)"
- Check if your server supports SSL

**3. 502 Bad Gateway**
- Backend container not responding
- Check backend health: `curl localhost:8080/api/actuator/health`

**4. Real IP not detected**
- Verify Cloudflare IP ranges in nginx config
- Check `CF-Connecting-IP` header handling

### Debug Commands
```bash
# Check container logs
docker-compose -f docker-compose.cloudflare.yml logs backend
docker-compose -f docker-compose.cloudflare.yml logs frontend

# Test internal network
docker exec -it shop_acc_game_frontend_prod curl http://backend:8080/api/actuator/health

# Check nginx config
docker exec -it shop_acc_game_frontend_prod nginx -t
```

## 📈 Performance Optimization

### Cloudflare Page Rules
```
URL: gurroshop.com/api/*
Settings:
- Cache Level: Bypass
- Security Level: High

URL: gurroshop.com/*
Settings:  
- Cache Level: Standard
- Browser Cache TTL: 1 month
- Edge Cache TTL: 1 week
```

### Docker Optimizations
- Use multi-stage builds (already implemented)
- Optimize JVM settings for your server specs
- Enable nginx gzip compression
- Use nginx caching for static assets

## 🔄 Deployment Workflow

1. **Update code** in your repository
2. **Build and deploy**:
   ```bash
   deploy-cloudflare.bat
   ```
3. **Purge Cloudflare cache** (if needed):
   ```bash
   # Via Cloudflare dashboard or API
   curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
        -H "Authorization: Bearer YOUR_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}'
   ```
4. **Monitor** application health and performance

## 📞 Support

For issues:
1. Check Docker container logs
2. Verify Cloudflare settings
3. Test direct server access
4. Check firewall and network configuration

---

**Your application is now optimized for Cloudflare! 🎉** 