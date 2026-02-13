# E-Commerce Platform

A production-ready, full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Features

### Security
- ✅ JWT-based authentication with refresh tokens
- ✅ Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ Account lockout after 5 failed login attempts
- ✅ Password reset flow with email verification
- ✅ Role-based access control (Customer/Admin)
- ✅ Input sanitization (XSS, NoSQL injection prevention)
- ✅ CSRF protection with origin verification
- ✅ Rate limiting (tiered: auth, API, public endpoints)
- ✅ Secure headers with Helmet.js
- ✅ Audit logging for critical actions
- ✅ Request validation and suspicious request detection

### Backend Features
- ✅ RESTful API with Express.js
- ✅ MongoDB database with optimized indexes
- ✅ JWT access (15min) and refresh (7d) tokens
- ✅ Comprehensive error handling
- ✅ Winston logger with daily log rotation
- ✅ Health check endpoints (basic + detailed)
- ✅ Cloudinary integration for image uploads
- ✅ Razorpay payment gateway integration
- ✅ Gzip compression for API responses
- ✅ Environment-based configuration

### Frontend Features
- ✅ React with Vite for fast development
- ✅ Tailwind CSS for styling
- ✅ Responsive design
- ✅ Shopping cart functionality
- ✅ Product catalog with search and filters
- ✅ User authentication flow
- ✅ Order management

### DevOps & Deployment
- ✅ Docker and Docker Compose support
- ✅ PM2 ecosystem configuration
- ✅ Nginx reverse proxy configuration
- ✅ GitHub Actions CI/CD pipeline
- ✅ Multiple environment configurations (dev, test, prod)
- ✅ ESLint and Prettier for code quality

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: MongoDB 7 + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, express-mongo-sanitize, xss-clean, express-rate-limit
- **Validation**: Joi
- **Logging**: Winston
- **Image Upload**: Cloudinary
- **Payment**: Razorpay
- **Cache**: Redis (optional)

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

### DevOps
- **Containerization**: Docker, Docker Compose
- **Process Manager**: PM2
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 5 or higher (or MongoDB Atlas account)
- npm 9 or higher

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YASHOTKARSH/Ecommerce.git
cd Ecommerce
```

2. **Backend Setup**
```bash
cd ecommerce-server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd ecommerce-client
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions

## 🔧 Environment Variables

### Required Variables
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CLIENT_URL=http://localhost:3000
```

See `.env.example` for complete list and descriptions.

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `POST /api/orders/verify-payment` - Verify payment

### Admin
- `GET /api/admin/audit-logs` - Get audit logs (admin)
- `GET /api/admin/audit-logs/stats` - Get audit statistics (admin)

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health info

See [API Documentation](docs/API.md) for complete details.

## 🔐 Security Features

1. **Authentication & Authorization**
   - JWT with short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days) with rotation
   - Role-based access control (Customer, Admin)
   - Account lockout after 5 failed login attempts (2 hours)

2. **Password Security**
   - Strong password requirements (8+ chars, mixed case, number, special char)
   - bcrypt hashing with salt rounds
   - Password reset with secure tokens (1 hour expiry)

3. **Input Validation & Sanitization**
   - Joi schema validation
   - XSS prevention with xss-clean
   - NoSQL injection prevention with express-mongo-sanitize
   - Content-type validation
   - Suspicious request detection

4. **Rate Limiting**
   - Auth endpoints: 5 requests/15 minutes
   - API endpoints: 100 requests/15 minutes
   - Public endpoints: 200 requests/15 minutes

5. **Security Headers**
   - Content Security Policy (CSP)
   - HSTS (Strict-Transport-Security)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy

6. **Audit Logging**
   - All critical actions logged (login, register, password changes, orders, etc.)
   - IP address and user agent tracking
   - Admin dashboard for viewing logs

## 🧪 Testing

```bash
# Backend
cd ecommerce-server
npm test

# Frontend
cd ecommerce-client
npm test

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

## 📊 Monitoring & Logging

### Application Logs
Logs are stored in `ecommerce-server/logs/`:
- `error-YYYY-MM-DD.log` - Error logs
- `combined-YYYY-MM-DD.log` - All logs
- Daily rotation with 14-day retention

### Health Checks
- **Basic**: `GET /api/health` - Server status
- **Detailed**: `GET /api/health/detailed` - Database, memory, uptime

### PM2 Monitoring
```bash
pm2 monit              # Real-time monitoring
pm2 logs ecommerce-api # View logs
pm2 status             # Process status
```

## 🚢 Production Deployment

### Option 1: Docker
See [Deployment Guide](docs/DEPLOYMENT.md) for Docker deployment instructions.

### Option 2: Traditional (VPS/Dedicated Server)
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm mongodb nginx

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/YASHOTKARSH/Ecommerce.git
cd Ecommerce/ecommerce-server
npm install --production
cp .env.production .env
# Edit .env with production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

See [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions.

## 🔄 CI/CD Pipeline

GitHub Actions workflow automatically:
1. Runs linters on backend and frontend
2. Runs tests (if available)
3. Performs security audit
4. Builds Docker images
5. Deploys to production (on main branch)

Configure deployment secrets in GitHub repository settings.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Run `npm run lint:fix` before committing
- Run `npm run format` to format code
- Write meaningful commit messages

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- YASHOTKARSH ([@YASHOTKARSH](https://github.com/YASHOTKARSH))

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the powerful database
- All open-source contributors

## 📧 Contact

For issues and questions:
- GitHub Issues: https://github.com/YASHOTKARSH/Ecommerce/issues
- Documentation: See `docs/` directory

---

**Built with ❤️ using the MERN Stack**