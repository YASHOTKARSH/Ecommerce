# E-Commerce Server

Production-ready backend for E-commerce platform built with Node.js, Express, and MongoDB.

## Features

### Security
- ✅ JWT access (15min) and refresh (7d) tokens with rotation
- ✅ Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ Account lockout after 5 failed login attempts (2 hours)
- ✅ Password reset flow with email verification
- ✅ Role-based access control (Customer/Admin)
- ✅ Input sanitization (XSS, NoSQL injection prevention)
- ✅ CSRF protection with origin verification
- ✅ Tiered rate limiting (auth: 5/15min, API: 100/15min, public: 200/15min)
- ✅ Secure headers with Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Audit logging for critical actions
- ✅ Request validation and suspicious request detection

### Features
- ✅ RESTful API with comprehensive error handling
- ✅ MongoDB with optimized indexes
- ✅ Winston logger with daily rotation
- ✅ Health check endpoints (basic + detailed)
- ✅ Gzip compression
- ✅ Environment-based configuration with validation
- ✅ Product management with search and filters
- ✅ Shopping cart functionality
- ✅ Order management with Razorpay integration
- ✅ Image upload with Cloudinary
- ✅ Admin dashboard with audit logs

## Project Structure

```
ecommerce-server/
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── env.js                # Environment validation
│   ├── logger.js             # Winston configuration
│   ├── cloudinary.js         # Cloudinary configuration
│   └── razorpay.js           # Razorpay configuration
├── controllers/
│   ├── authController.js     # Authentication & authorization
│   ├── productController.js  # Product management
│   ├── cartController.js     # Shopping cart
│   ├── orderController.js    # Order management
│   └── adminController.js    # Admin operations
├── models/
│   ├── User.js               # User schema with security features
│   ├── Product.js            # Product schema with indexes
│   ├── Cart.js               # Cart schema
│   ├── Order.js              # Order schema with indexes
│   └── AuditLog.js           # Audit log schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── productRoutes.js      # Product endpoints
│   ├── cartRoutes.js         # Cart endpoints
│   ├── orderRoutes.js        # Order endpoints
│   └── adminRoutes.js        # Admin endpoints
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── roleAuth.js           # Role-based access control
│   ├── error.js              # Error handler
│   ├── validation.js         # Joi validation
│   ├── rateLimiter.js        # Tiered rate limiting
│   ├── sanitize.js           # Input sanitization
│   ├── requestValidator.js   # Request validation
│   ├── auditLogger.js        # Audit logging
│   ├── csrf.js               # CSRF protection
│   └── upload.js             # File upload handling
├── utils/
│   ├── ApiError.js           # Custom error class
│   ├── asyncHandler.js       # Async error wrapper
│   ├── errors.js             # Custom error classes
│   ├── passwordValidator.js  # Password strength validation
│   ├── stockManager.js       # Stock management
│   └── stockValidator.js     # Stock validation
├── validations/              # Joi validation schemas
├── logs/                     # Application logs (auto-created)
├── .env.example              # Environment template
├── .env.development          # Development config
├── .env.production           # Production config
├── .env.test                 # Test config
├── .eslintrc.json            # ESLint configuration
├── .prettierrc.json          # Prettier configuration
├── Dockerfile                # Docker image definition
├── ecosystem.config.js       # PM2 configuration
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
└── index.js                  # Server entry point
```

## Setup

### 1. Install Dependencies

```bash
cd ecommerce-server
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 4. Start Server

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "address": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Protected Route Test
```http
GET /api/auth/protected
Authorization: Bearer jwt-token-here
```

#### Admin Only Route Test
```http
GET /api/auth/admin-only
Authorization: Bearer jwt-token-here
```
*Note: Requires user with 'admin' role*

### Health Check
```http
GET /api/health
```

## Testing with cURL

### 1. Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get current user (replace TOKEN with actual token):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### 4. Test protected route:
```bash
curl -X GET http://localhost:5000/api/auth/protected \
  -H "Authorization: Bearer TOKEN"
```

### 5. Test admin route (will fail for customer role):
```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer TOKEN"
```

## Testing with Postman

1. Import the following collection URL or create requests manually
2. For protected routes, add token in Headers:
   - Key: `Authorization`
   - Value: `Bearer your-token-here`
3. Or use cookies (token is automatically set as httpOnly cookie)

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 30-day expiration
- httpOnly cookies for token storage
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- Input validation with Joi
- CORS protection
- CSRF protection with origin verification and SameSite cookies
- Centralized error handling (no stack traces in production)

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Role-Based Access Control

Users have one of two roles:
- `customer` (default) - Regular user access
- `admin` - Full administrative access

To test admin routes, manually update a user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Development

### Install dev dependencies:
```bash
npm install --save-dev nodemon
```

### Run in development mode:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong JWT_SECRET
3. Enable HTTPS
4. Use production MongoDB connection
5. Configure proper CORS origins
6. Set up proper logging
7. Use process manager (PM2)

## Next Steps

This backend is ready for:
- Product management module
- Cart and order management
- Payment integration (Razorpay)
- Image upload (Cloudinary)
- Admin dashboard
- Customer reviews
- Search and filtering

## License

ISC
