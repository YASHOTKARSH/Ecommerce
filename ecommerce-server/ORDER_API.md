# Order Management API Documentation

## Overview
This document describes the order management and payment integration endpoints for the E-commerce platform, including Razorpay payment gateway integration.

## Security
All order endpoints require authentication via JWT token. Users can only access their own orders (admins can access all orders).

## Payment Flow

### Step 1: Create Razorpay Order
First, call this endpoint to create a Razorpay order with the current cart contents.

### Step 2: Complete Payment (Frontend)
Use Razorpay SDK on the frontend to complete the payment with the order ID from Step 1.

### Step 3: Verify Payment
Send payment details to this endpoint to verify the payment signature and create the order.

## Endpoints

### 1. Create Razorpay Order
**POST** `/api/orders/create-razorpay-order`

Creates a Razorpay order after validating cart and stock availability.

**Authentication**: Required

**Request Body**: None (uses authenticated user's cart)

**Success Response (200)**:
```json
{
  "success": true,
  "order": {
    "id": "order_MN3xyzabcdefgh",
    "amount": 159900,
    "currency": "INR"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Cart is empty or insufficient stock
- `500 Internal Server Error`: Razorpay not configured

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/orders/create-razorpay-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 2. Verify Payment & Create Order
**POST** `/api/orders/verify-payment`

Verifies Razorpay payment signature and creates the order. This endpoint:
- Verifies the payment signature using HMAC-SHA256
- Creates the order in the database
- Reduces product stock atomically using MongoDB transactions
- Clears the user's cart

**Authentication**: Required

**Request Body**:
```json
{
  "razorpay_order_id": "order_MN3xyzabcdefgh",
  "razorpay_payment_id": "pay_MN3xyzabcdefgh",
  "razorpay_signature": "abc123def456...",
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India",
    "phone": "+91 9876543210"
  }
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "65f1234567890abcdef",
    "userId": "65e1234567890abcdef",
    "items": [
      {
        "productId": "65d1234567890abcdef",
        "quantity": 2,
        "price": 999,
        "discount": 10,
        "finalPrice": 1798.20
      }
    ],
    "totalAmount": 1798.20,
    "paymentStatus": "completed",
    "orderStatus": "confirmed",
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+91 9876543210"
    },
    "paymentId": "pay_MN3xyzabcdefgh",
    "razorpayOrderId": "order_MN3xyzabcdefgh",
    "createdAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation error, payment verification failed, or insufficient stock
- `404 Not Found`: Cart or product not found

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/orders/verify-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_MN3xyzabcdefgh",
    "razorpay_payment_id": "pay_MN3xyzabcdefgh",
    "razorpay_signature": "abc123def456...",
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+91 9876543210"
    }
  }'
```

---

### 3. Get My Orders
**GET** `/api/orders/my-orders`

Retrieves all orders for the authenticated user with pagination.

**Authentication**: Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Success Response (200)**:
```json
{
  "success": true,
  "orders": [
    {
      "_id": "65f1234567890abcdef",
      "userId": "65e1234567890abcdef",
      "items": [...],
      "totalAmount": 1798.20,
      "paymentStatus": "completed",
      "orderStatus": "confirmed",
      "shippingAddress": {...},
      "createdAt": "2026-02-13T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Example cURL**:
```bash
curl -X GET "http://localhost:5000/api/orders/my-orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Order by ID
**GET** `/api/orders/:id`

Retrieves details of a specific order. Users can only access their own orders unless they're an admin.

**Authentication**: Required

**URL Parameters**:
- `id`: Order ID

**Success Response (200)**:
```json
{
  "success": true,
  "order": {
    "_id": "65f1234567890abcdef",
    "userId": "65e1234567890abcdef",
    "items": [
      {
        "productId": {
          "_id": "65d1234567890abcdef",
          "name": "Product Name",
          "price": 999,
          "images": [...]
        },
        "quantity": 2,
        "price": 999,
        "discount": 10,
        "finalPrice": 1798.20
      }
    ],
    "totalAmount": 1798.20,
    "paymentStatus": "completed",
    "orderStatus": "confirmed",
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "phone": "+91 9876543210"
    },
    "paymentId": "pay_MN3xyzabcdefgh",
    "razorpayOrderId": "order_MN3xyzabcdefgh",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `403 Forbidden`: Not authorized to access this order
- `404 Not Found`: Order not found

**Example cURL**:
```bash
curl -X GET http://localhost:5000/api/orders/65f1234567890abcdef \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Cancel Order
**PUT** `/api/orders/:id/cancel`

Cancels an order and restores product stock. Only orders with status `processing` or `confirmed` can be cancelled.

**Authentication**: Required

**URL Parameters**:
- `id`: Order ID

**Request Body** (optional):
```json
{
  "reason": "Changed my mind"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "65f1234567890abcdef",
    "orderStatus": "cancelled",
    "updatedAt": "2026-02-13T11:00:00.000Z",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: Order cannot be cancelled (wrong status)
- `403 Forbidden`: Not authorized to cancel this order
- `404 Not Found`: Order not found

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/orders/65f1234567890abcdef/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

---

## Order Status Flow

1. **processing** → Order created, payment pending
2. **confirmed** → Payment verified and successful
3. **shipped** → Order dispatched
4. **delivered** → Order completed
5. **cancelled** → Order cancelled (only from processing/confirmed)

## Payment Status

- **pending**: Payment not yet completed
- **completed**: Payment successful and verified
- **failed**: Payment failed
- **refunded**: Payment refunded

## Important Notes

### Security
- ✅ All payment signatures are verified server-side using HMAC-SHA256
- ✅ Orders are only created after successful payment verification
- ✅ Stock is reduced atomically using MongoDB transactions
- ✅ Users can only access their own orders (except admins)
- ✅ Cart is cleared only after successful order creation

### Transaction Safety
- Stock reduction uses MongoDB transactions to ensure atomicity
- If any operation fails, the entire transaction is rolled back
- Prevents overselling and race conditions

### Testing
To test the payment flow:
1. Add items to cart (requires cart API from Milestone 2)
2. Create Razorpay order
3. Use Razorpay test mode credentials
4. Complete payment on frontend using Razorpay SDK
5. Verify payment with signature

### Environment Variables Required
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Error Response Format
All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Rate Limiting
All endpoints are subject to rate limiting:
- 100 requests per 15 minutes per IP address
