# E-Commerce Platform Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [PM2 Deployment](#pm2-deployment)
- [Database Setup](#database-setup)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: v5 or higher (or MongoDB Atlas account)
- **Docker**: v20 or higher (for Docker deployment)
- **Docker Compose**: v2 or higher (for Docker deployment)
- **PM2**: Global installation (for PM2 deployment)
- **Nginx**: Latest stable version (for reverse proxy)

### Optional Software
- **Redis**: v7 or higher (for caching)
- **Git**: For version control
- **Certbot**: For SSL certificates (Let's Encrypt)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/YASHOTKARSH/Ecommerce.git
cd Ecommerce
```

### 2. Backend Environment Variables

Navigate to the backend directory and create a `.env` file:

```bash
cd ecommerce-server
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=production

# Server
PORT=5000

# Database (use MongoDB Atlas for production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secrets (MUST be strong random strings - use: openssl rand -base64 64)
JWT_SECRET=your-very-strong-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-very-strong-refresh-secret-key-different-from-jwt-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Razorpay (get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (get from https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail example - use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
CLIENT_URL=https://yourdomain.com

# Redis (optional but recommended for production)
REDIS_URL=redis://localhost:6379

# Sentry (optional - for error tracking)
SENTRY_DSN=your_sentry_dsn
```

### 3. Generate Strong Secrets

Generate strong JWT secrets:

```bash
# JWT Secret
openssl rand -base64 64

# JWT Refresh Secret
openssl rand -base64 64
```

Copy these to your `.env` file.

## Local Development

### Backend

```bash
cd ecommerce-server

# Install dependencies
npm install

# Start development server with nodemon
npm run dev

# Or start production server
npm start
```

Server will run on `http://localhost:5000`

### Frontend

```bash
cd ecommerce-client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Development server will run on `http://localhost:3000`

## Docker Deployment

### 1. Prepare Environment

Create a `.env` file in the root directory with all required variables (see Backend Environment Variables section).

### 2. Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### 3. Access Services

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

### 4. Individual Container Management

```bash
# Backend only
docker-compose up -d backend

# Frontend only
docker-compose up -d frontend

# Database only
docker-compose up -d mongodb redis
```

## Production Deployment

### Option 1: VPS/Dedicated Server (Ubuntu/Debian)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Redis (optional)
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### 2. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/YASHOTKARSH/Ecommerce.git
cd Ecommerce

# Backend setup
cd ecommerce-server
sudo npm install --production
sudo cp .env.production .env
# Edit .env with your production values
sudo nano .env

# Frontend setup
cd ../ecommerce-client
sudo npm install
sudo npm run build
```

#### 3. Configure PM2

```bash
cd /var/www/Ecommerce/ecommerce-server

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output to complete setup
```

#### 4. Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/Ecommerce/nginx.conf /etc/nginx/sites-available/ecommerce

# Edit with your domain
sudo nano /etc/nginx/sites-available/ecommerce

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 5. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Option 2: Docker on Production Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
cd /var/www
sudo git clone https://github.com/YASHOTKARSH/Ecommerce.git
cd Ecommerce

# Create .env file
sudo nano .env
# Add all production environment variables

# Start services
sudo docker-compose up -d

# View logs
sudo docker-compose logs -f
```

## PM2 Deployment

### Basic Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Start in production mode
pm2 start ecosystem.config.js --env production

# Stop application
pm2 stop ecommerce-api

# Restart application
pm2 restart ecommerce-api

# View logs
pm2 logs ecommerce-api

# Monitor
pm2 monit

# List all processes
pm2 list

# Delete process
pm2 delete ecommerce-api

# Save current process list
pm2 save

# Resurrect processes on reboot
pm2 resurrect
```

### Zero-Downtime Deployment

```bash
# Pull latest code
cd /var/www/Ecommerce/ecommerce-server
git pull

# Install new dependencies
npm install --production

# Reload with zero downtime
pm2 reload ecosystem.config.js --env production
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string and add to `.env` as `MONGO_URI`

### Local MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod

# Create database user (optional but recommended)
mongosh
use ecommerce
db.createUser({
  user: "ecommerce_user",
  pwd: "strong_password",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})
```

Update `MONGO_URI` in `.env`:
```
MONGO_URI=mongodb://ecommerce_user:strong_password@localhost:27017/ecommerce
```

### Database Indexes

Indexes are automatically created when models are loaded. To manually create indexes:

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Switch to database
use ecommerce

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.products.createIndex({ title: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.auditlogs.createIndex({ userId: 1, timestamp: -1 })
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certificate auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### Option 2: Manual Certificate

1. Obtain SSL certificate from your provider
2. Copy certificate files to server:
   - Certificate: `/etc/ssl/certs/yourdomain.crt`
   - Private Key: `/etc/ssl/private/yourdomain.key`
   - CA Bundle: `/etc/ssl/certs/ca-bundle.crt`

3. Update Nginx configuration with certificate paths
4. Reload Nginx: `sudo systemctl reload nginx`

## Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web-based monitoring (PM2 Plus)
pm2 plus

# View logs
pm2 logs ecommerce-api

# Flush logs
pm2 flush
```

### Application Logs

Logs are stored in `ecommerce-server/logs/`:
- `error-YYYY-MM-DD.log` - Error logs
- `combined-YYYY-MM-DD.log` - All logs

```bash
# View error logs
tail -f /var/www/Ecommerce/ecommerce-server/logs/error-$(date +%Y-%m-%d).log

# View combined logs
tail -f /var/www/Ecommerce/ecommerce-server/logs/combined-$(date +%Y-%m-%d).log
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Logs

```bash
# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Setup Log Rotation

PM2 handles log rotation automatically. For custom log rotation:

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/ecommerce

# Add configuration:
/var/www/Ecommerce/ecommerce-server/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
}
```

## Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs ecommerce-api

# Check environment variables
pm2 env 0  # where 0 is the process id

# Verify MongoDB connection
mongosh "your-connection-string"

# Check port availability
sudo lsof -i :5000
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "your-connection-string"

# Check MongoDB service
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check firewall rules
sudo ufw status
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check if port 80/443 is in use
sudo lsof -i :80
sudo lsof -i :443
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER /var/www/Ecommerce

# Fix node_modules permissions
cd /var/www/Ecommerce/ecommerce-server
sudo rm -rf node_modules
npm install
```

### High Memory Usage

```bash
# Check PM2 memory limits
pm2 show ecommerce-api

# Restart with memory limit
pm2 restart ecommerce-api --max-memory-restart 500M

# Check system resources
free -h
df -h
```

### Rate Limiting Issues

If users are getting rate limited too frequently:

1. Check nginx rate limiting configuration
2. Adjust rate limits in `middleware/rateLimiter.js`
3. Consider implementing Redis for distributed rate limiting

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force certificate renewal
sudo certbot renew --force-renewal
```

## Performance Optimization

### 1. Enable Gzip Compression

Already configured in Nginx. Verify:

```bash
curl -H "Accept-Encoding: gzip" -I https://yourdomain.com
```

### 2. Enable Redis Caching

```bash
# Install Redis
sudo apt install redis-server

# Update .env
REDIS_URL=redis://localhost:6379

# Restart application
pm2 restart ecommerce-api
```

### 3. Database Optimization

```bash
# Enable MongoDB profiling
mongosh
use ecommerce
db.setProfilingLevel(1, { slowms: 100 })

# View slow queries
db.system.profile.find().limit(10).sort({ ts: -1 })
```

### 4. PM2 Cluster Mode

Already configured in `ecosystem.config.js` with `instances: 'max'`. This uses all CPU cores.

## Backup & Recovery

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="your-connection-string" --out=/backup/mongodb-$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="your-connection-string" /backup/mongodb-20240101
```

### Application Backup

```bash
# Backup application files
sudo tar -czf /backup/ecommerce-$(date +%Y%m%d).tar.gz /var/www/Ecommerce

# Restore
sudo tar -xzf /backup/ecommerce-20240101.tar.gz -C /
```

### Automated Backups

Create a backup script `/usr/local/bin/backup-ecommerce.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d)

# Backup MongoDB
mongodump --uri="your-connection-string" --out=$BACKUP_DIR/mongodb-$DATE

# Backup application
tar -czf $BACKUP_DIR/ecommerce-$DATE.tar.gz /var/www/Ecommerce

# Remove backups older than 7 days
find $BACKUP_DIR -name "mongodb-*" -mtime +7 -delete
find $BACKUP_DIR -name "ecommerce-*.tar.gz" -mtime +7 -delete
```

Add to crontab:

```bash
sudo crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-ecommerce.sh
```

## Security Checklist

- [ ] Strong JWT secrets configured
- [ ] MongoDB authentication enabled
- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Environment variables not committed to Git
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] Input sanitization enabled
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] MongoDB user authentication enabled
- [ ] Backup strategy implemented
- [ ] Monitoring setup (PM2 Plus or similar)
- [ ] Error tracking configured (Sentry)

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Production Checklist](https://docs.mongodb.com/manual/administration/production-checklist-operations/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For issues and questions:
- GitHub Issues: https://github.com/YASHOTKARSH/Ecommerce/issues
- Documentation: See `docs/API.md` for API reference
