# E-Commerce Platform API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Admin](#admin)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://yourdomain.com/api`

## Authentication

All authenticated requests require a JWT token in one of the following ways:
1. **Authorization header**: `Authorization: Bearer <token>`
2. **Cookie**: Token automatically set as `httpOnly` cookie

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Error Response:** `423 Locked` (Account locked after 5 failed attempts)
```json
{
  "success": false,
  "error": "Account is locked due to too many failed login attempts. Please try again later."
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Or send refresh token in cookie (automatic).

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Forgot Password

**POST** `/auth/forgot-password`

Request a password reset link.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

### Reset Password

**POST** `/auth/reset-password/:token`

Reset password using the token from email.

**Request Body:**
```json
{
  "password": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Get Current User

**GET** `/auth/me`

Get authenticated user's information.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Products

### Get All Products

**GET** `/products`

Get a paginated list of products with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `search` (string): Search in title and description
- `sort` (string): Sort field (e.g., 'price', '-price', 'createdAt')

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "64a1b2c3d4e5f6...",
      "title": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "discount": 10,
      "finalPrice": 89.99,
      "stock": 50,
      "category": "Electronics",
      "images": ["url1.jpg", "url2.jpg"],
      "ratings": {
        "average": 4.5,
        "count": 120
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Product by ID

**GET** `/products/:id`

Get detailed information about a specific product.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6...",
    "title": "Product Name",
    "description": "Detailed product description",
    "price": 99.99,
    "discount": 10,
    "finalPrice": 89.99,
    "stock": 50,
    "category": "Electronics",
    "images": ["url1.jpg", "url2.jpg"],
    "ratings": {
      "average": 4.5,
      "count": 120
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Product (Admin Only)

**POST** `/products`

Create a new product.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "discount": 10,
  "stock": 50,
  "category": "Electronics",
  "images": ["url1.jpg", "url2.jpg"]
}
```

**Response:** `201 Created`

### Update Product (Admin Only)

**PUT** `/products/:id`

Update an existing product.

**Authentication:** Required (Admin)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Product Name",
  "price": 89.99,
  "stock": 45
}
```

**Response:** `200 OK`

### Delete Product (Admin Only)

**DELETE** `/products/:id`

Delete a product.

**Authentication:** Required (Admin)

**Response:** `200 OK`

## Cart

### Get Cart

**GET** `/cart`

Get the authenticated user's cart.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": {
          "id": "64a1b2c3d4e5f6...",
          "title": "Product Name",
          "price": 99.99,
          "images": ["url1.jpg"]
        },
        "quantity": 2,
        "price": 99.99
      }
    ],
    "totalAmount": 199.98
  }
}
```

### Add to Cart

**POST** `/cart`

Add a product to cart.

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "64a1b2c3d4e5f6...",
  "quantity": 2
}
```

**Response:** `200 OK`

### Update Cart Item

**PUT** `/cart/:productId`

Update quantity of a cart item.

**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** `200 OK`

### Remove from Cart

**DELETE** `/cart/:productId`

Remove a product from cart.

**Authentication:** Required

**Response:** `200 OK`

### Clear Cart

**DELETE** `/cart`

Remove all items from cart.

**Authentication:** Required

**Response:** `200 OK`

## Orders

### Create Order

**POST** `/orders`

Create a new order from cart items.

**Authentication:** Required

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "orderId": "64a1b2c3d4e5f6...",
    "razorpayOrderId": "order_xyz123",
    "amount": 19998,
    "currency": "INR"
  }
}
```

### Get User Orders

**GET** `/orders`

Get all orders for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by order status

**Response:** `200 OK`

### Get Order by ID

**GET** `/orders/:id`

Get detailed information about a specific order.

**Authentication:** Required

**Response:** `200 OK`

### Verify Payment

**POST** `/orders/verify-payment`

Verify Razorpay payment signature.

**Authentication:** Required

**Request Body:**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

**Response:** `200 OK`

## Admin

### Get Audit Logs

**GET** `/admin/audit-logs`

Get system audit logs.

**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `userId` (string): Filter by user ID
- `action` (string): Filter by action type
- `resource` (string): Filter by resource type
- `status` (string): Filter by status (success/failure)
- `startDate` (string): Filter by start date (ISO 8601)
- `endDate` (string): Filter by end date (ISO 8601)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "user.login",
      "resource": "user",
      "resourceId": "64a1b2c3d4e5f6...",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "method": "POST",
        "path": "/api/auth/login"
      },
      "status": "success",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

### Get Audit Statistics

**GET** `/admin/audit-logs/stats`

Get audit log statistics.

**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "byAction": [
      { "_id": "user.login", "count": 150 },
      { "_id": "order.create", "count": 75 }
    ],
    "byStatus": [
      { "_id": "success", "count": 220 },
      { "_id": "failure", "count": 5 }
    ]
  }
}
```

## Health Check

### Basic Health Check

**GET** `/health`

Check if the server is running.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Detailed Health Check

**GET** `/health/detailed`

Get detailed health information.

**Response:** `200 OK`
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "name": "ecommerce"
  },
  "memory": {
    "used": "150 MB",
    "total": "200 MB"
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limited)
- `500` - Server Error

### Common Error Examples

**Validation Error:**
```json
{
  "success": false,
  "error": "Password must be at least 8 characters long"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Authorization Error:**
```json
{
  "success": false,
  "error": "Access denied. Admin privileges required"
}
```

## Rate Limiting

Different endpoints have different rate limits:

### Authentication Endpoints
- **Limit:** 5 requests per 15 minutes
- **Applies to:** `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`

### API Endpoints
- **Limit:** 100 requests per 15 minutes
- **Applies to:** All `/api/*` endpoints (except auth)

### Public Endpoints
- **Limit:** 200 requests per 15 minutes
- **Applies to:** `/api/health`, `/api/products` (GET)

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later"
}
```

## Security Features

1. **Password Requirements:** Strong password validation with minimum 8 characters, uppercase, lowercase, number, and special character
2. **Account Lockout:** Account locked for 2 hours after 5 failed login attempts
3. **JWT Tokens:** Short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days)
4. **CSRF Protection:** Origin verification for cookie-based authentication
5. **Input Sanitization:** XSS and NoSQL injection prevention
6. **Rate Limiting:** IP-based rate limiting on all endpoints
7. **Audit Logging:** All critical actions are logged with IP address and user agent
8. **Secure Headers:** Helmet.js configured with strict security policies

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary amounts are in the smallest currency unit (e.g., paise for INR)
- File uploads have a 10MB limit per request
- All list endpoints support pagination with `page` and `limit` parameters
