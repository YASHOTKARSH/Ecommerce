# E-Commerce Server

Production-ready backend for E-commerce platform built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication (Register/Login)
- ✅ JWT-based authorization
- ✅ Role-based access control (Customer/Admin)
- ✅ Password hashing with bcrypt
- ✅ Order placement with Razorpay integration
- ✅ Payment signature verification
- ✅ Stock management with MongoDB transactions
- ✅ Order tracking and history
- ✅ Input validation with Joi
- ✅ Centralized error handling
- ✅ Security headers with Helmet
- ✅ Rate limiting
- ✅ CORS support
- ✅ Cloudinary integration ready

## Project Structure

```
ecommerce-server/
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── cloudinary.js            # Cloudinary configuration
│   └── razorpay.js              # Razorpay configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   └── orderController.js       # Order management logic
├── models/
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Cart.js                  # Cart schema
│   └── Order.js                 # Order schema
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   └── orderRoutes.js           # Order endpoints
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── roleAuth.js              # Role-based access control
│   ├── error.js                 # Error handler
│   ├── csrf.js                  # CSRF protection
│   └── validation.js            # Joi validation
├── utils/
│   ├── ApiError.js              # Custom error class
│   ├── asyncHandler.js          # Async error wrapper
│   └── stockManager.js          # Stock management with transactions
├── validations/
│   └── orderValidation.js       # Order validation schemas
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── index.js                     # Server entry point
├── ORDER_API.md                 # Order API documentation
├── ORDER_IMPLEMENTATION.md      # Implementation summary
└── SECURITY.md                  # Security documentation
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

### Order Management

For complete order API documentation, see [ORDER_API.md](ORDER_API.md).

#### Quick Order Endpoints Overview
- **POST** `/api/orders/create-razorpay-order` - Create Razorpay order
- **POST** `/api/orders/verify-payment` - Verify payment & create order
- **GET** `/api/orders/my-orders` - Get user's orders
- **GET** `/api/orders/:id` - Get order by ID
- **PUT** `/api/orders/:id/cancel` - Cancel order

All order endpoints require authentication.

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
- Razorpay payment signature verification (HMAC-SHA256)
- MongoDB transactions for atomic operations
- Stock management with race condition prevention
- Order authorization (users access only their orders)
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- Input validation with Joi
- CORS protection
- CSRF protection with origin verification and SameSite cookies
- Centralized error handling (no stack traces in production)

For detailed security information, see [SECURITY.md](SECURITY.md).

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
3. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from Razorpay dashboard
4. Enable HTTPS
5. Use production MongoDB connection with replica set (for transactions)
6. Configure proper CORS origins
7. Set up proper logging
8. Use process manager (PM2)

## Implemented Features

✅ **Milestone 1**: Backend Core Setup
- User authentication and authorization
- JWT-based session management
- Role-based access control
- Security middleware and CSRF protection

✅ **Milestone 3**: Order Placement & Payment
- Razorpay payment integration
- Order creation and tracking
- Stock management with transactions
- Payment signature verification

## Next Steps

This backend is ready for:
- ⏳ Product management API (CRUD endpoints)
- ⏳ Cart management API (CRUD endpoints)
- ⏳ Admin dashboard (Milestone 4)
- ⏳ Customer reviews
- ⏳ Search and filtering
- ⏳ Image upload (Cloudinary)

## Documentation

- [ORDER_API.md](ORDER_API.md) - Complete order API documentation
- [ORDER_IMPLEMENTATION.md](ORDER_IMPLEMENTATION.md) - Implementation details
- [SECURITY.md](SECURITY.md) - Security measures and analysis
- [TESTING.md](TESTING.md) - Testing guide

## License

ISC
