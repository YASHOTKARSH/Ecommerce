# Order System Implementation Guide

## Overview
This document describes the complete order and payment system implementation for the E-commerce platform, including Razorpay integration, payment verification, and stock management.

## Architecture

### Two-Phase Payment Flow
The system implements a secure two-phase payment flow:

**Phase 1: Order Preparation**
```
Client → POST /api/orders/create-razorpay-order
        ↓
Server validates cart and stock
        ↓
Server creates Razorpay order (NO stock reduction)
        ↓
Server returns order details to client
```

**Phase 2: Payment Verification & Order Creation**
```
Client completes payment with Razorpay
        ↓
Razorpay returns: order_id, payment_id, signature
        ↓
Client → POST /api/orders/verify-payment
        ↓
Server VERIFIES signature (HMAC-SHA256)
        ↓
IF valid:
  → Start MongoDB transaction
  → Reduce stock atomically
  → Create order
  → Clear cart
  → Commit transaction
  → Return success
ELSE:
  → Reject request
```

## API Endpoints

### 1. Create Razorpay Order
**Endpoint**: `POST /api/orders/create-razorpay-order`  
**Auth**: Required (JWT)  
**Purpose**: Prepares order for payment (validates but doesn't reduce stock)

**Request Body**:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "order_XXXXX",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_XXXXX"
}
```

**Process**:
1. Validates shipping address
2. Gets user's cart
3. Validates cart is not empty
4. Validates stock availability for all items
5. Calculates total amount
6. Creates Razorpay order
7. Returns order details (NO stock reduction yet)

### 2. Verify Payment & Create Order
**Endpoint**: `POST /api/orders/verify-payment`  
**Auth**: Required (JWT)  
**Purpose**: Verifies payment and creates order (reduces stock)

**Request Body**:
```json
{
  "razorpay_order_id": "order_XXXXX",
  "razorpay_payment_id": "pay_XXXXX",
  "razorpay_signature": "signature_XXXXX",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "totalAmount": 500,
    "shippingAddress": {...},
    "paymentStatus": "completed",
    "orderStatus": "processing",
    "razorpayOrderId": "order_XXXXX",
    "paymentId": "pay_XXXXX",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Process**:
1. Validates payment details
2. **CRITICAL**: Verifies Razorpay signature using HMAC-SHA256
   ```javascript
   generated_signature = HMAC-SHA256(
     razorpay_order_id + "|" + razorpay_payment_id,
     RAZORPAY_KEY_SECRET
   )
   if (generated_signature !== razorpay_signature) {
     reject()
   }
   ```
3. Gets user's cart
4. Prepares order items with price information
5. **Reduces stock atomically using MongoDB transaction**
6. Creates order
7. Clears cart
8. Returns order details

### 3. Get User Orders
**Endpoint**: `GET /api/orders/my-orders?page=1&limit=10`  
**Auth**: Required (JWT)  
**Purpose**: Get paginated list of user's orders

**Response**:
```json
{
  "success": true,
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 4. Get Order by ID
**Endpoint**: `GET /api/orders/:id`  
**Auth**: Required (JWT)  
**Purpose**: Get details of a specific order

**Authorization**: User must own the order OR be an admin

**Response**:
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "userId": {...},
    "items": [
      {
        "productId": {...},
        "quantity": 2,
        "price": 200,
        "discount": 10,
        "finalPrice": 180
      }
    ],
    "totalAmount": 360,
    "shippingAddress": {...},
    "paymentStatus": "completed",
    "orderStatus": "processing",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 5. Cancel Order
**Endpoint**: `PUT /api/orders/:id/cancel`  
**Auth**: Required (JWT)  
**Purpose**: Cancel an order and restore stock

**Authorization**: User must own the order OR be an admin

**Response**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {...}
}
```

**Warning Response** (if stock restoration fails):
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "warning": "Order cancelled successfully, but stock restoration encountered an error. Please contact support with order ID 123456 to verify inventory.",
  "order": {...}
}
```

**Process**:
1. Validates user owns order
2. Checks order can be cancelled (not already cancelled or delivered)
3. **Restores stock atomically using MongoDB transaction**
4. Updates order status to "cancelled"
5. Returns success (with warning if stock restoration failed)

## Stock Management

### Stock Manager Utility
Location: `utils/stockManager.js`

#### reduceStock(items)
Reduces stock for multiple products atomically.

**Parameters**:
```javascript
items = [
  { productId: ObjectId, quantity: Number },
  ...
]
```

**Process**:
1. Starts MongoDB transaction
2. For each item:
   - Validates product exists
   - Validates sufficient stock
   - Reduces stock using atomic update with condition:
     ```javascript
     { _id: productId, stock: { $gte: quantity } }
     { $inc: { stock: -quantity } }
     ```
3. Commits transaction if all succeed
4. Rolls back if any operation fails

**Error Handling**:
- Throws ApiError if product not found
- Throws ApiError if insufficient stock
- Throws ApiError if atomic update fails
- Automatic transaction rollback on error

#### restoreStock(items)
Restores stock for cancelled orders.

**Parameters**:
```javascript
items = [
  { productId: ObjectId, quantity: Number },
  ...
]
```

**Process**:
1. Starts MongoDB transaction
2. For each item:
   - Finds product
   - If not found, logs warning but continues
   - Restores stock using atomic update:
     ```javascript
     { _id: productId }
     { $inc: { stock: quantity } }
     ```
3. Commits transaction

**Error Handling**:
- Logs warning for missing products but doesn't fail
- Automatic transaction rollback on error

## Security Features

### 1. Payment Signature Verification
**CRITICAL**: All payments MUST be verified before creating orders.

**Implementation**:
```javascript
const crypto = require('crypto');

const generated_signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generated_signature !== razorpay_signature) {
  throw new ApiError(400, 'Payment verification failed');
}
```

**Why This Matters**:
- Prevents fraudulent orders
- Ensures payment was actually completed
- Protects against man-in-the-middle attacks
- Required by payment gateway for security

### 2. MongoDB Transactions
**Purpose**: Ensures data consistency and prevents race conditions.

**Use Cases**:
- Stock reduction during order creation
- Stock restoration during order cancellation
- Multiple product updates in single operation

**Benefits**:
- Atomic operations (all or nothing)
- Automatic rollback on failure
- Prevents overselling
- Prevents race conditions

### 3. Stock Validation
**Two-Level Validation**:
1. **Pre-flight check**: Before creating Razorpay order
2. **Transaction check**: During atomic stock reduction

**Prevents**:
- Overselling
- Race conditions
- Stock inconsistencies

### 4. Order Ownership Verification
**Implementation**:
```javascript
if (order.userId.toString() !== userId && req.user.role !== 'admin') {
  throw new ApiError(403, 'Not authorized');
}
```

**Protects**:
- User privacy
- Order data
- Payment information

### 5. Input Validation
**Joi Schemas** for:
- Shipping address (all fields required)
- Payment verification data (all fields required)
- Order creation data

**Prevents**:
- Invalid data in database
- Missing required fields
- Type confusion attacks

## Database Schema

### Order Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number,
    discount: Number,
    finalPrice: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentStatus: String (pending/completed/failed),
  orderStatus: String (pending/processing/shipped/delivered/cancelled),
  razorpayOrderId: String,
  paymentId: String,
  razorpaySignature: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId + createdAt` (for order history queries)
- `razorpayOrderId` (for payment verification)

## Frontend Integration

### Step 1: Create Razorpay Order
```javascript
const response = await fetch('/api/orders/create-razorpay-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ shippingAddress })
});

const { orderId, amount, currency, key } = await response.json();
```

### Step 2: Open Razorpay Checkout
```javascript
const options = {
  key: key,
  amount: amount,
  currency: currency,
  order_id: orderId,
  handler: function(response) {
    verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### Step 3: Verify Payment
```javascript
async function verifyPayment(razorpayResponse) {
  const response = await fetch('/api/orders/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      shippingAddress: shippingAddress
    })
  });

  const data = await response.json();
  // Show success message and redirect to order page
}
```

## Testing

### Manual Testing Flow

1. **Create Test User**
   ```bash
   POST /api/auth/register
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```

2. **Add Products to Cart**
   ```bash
   POST /api/cart
   {
     "productId": "product_id",
     "quantity": 2
   }
   ```

3. **Create Order**
   ```bash
   POST /api/orders/create-razorpay-order
   {
     "shippingAddress": {
       "street": "123 Main St",
       "city": "Mumbai",
       "state": "Maharashtra",
       "zipCode": "400001",
       "country": "India"
     }
   }
   ```

4. **Complete Payment** (in Razorpay test mode)

5. **Verify Payment**
   ```bash
   POST /api/orders/verify-payment
   {
     "razorpay_order_id": "...",
     "razorpay_payment_id": "...",
     "razorpay_signature": "...",
     "shippingAddress": {...}
   }
   ```

6. **Check Stock Reduction** in database

7. **View Orders**
   ```bash
   GET /api/orders/my-orders
   ```

8. **Cancel Order**
   ```bash
   PUT /api/orders/:id/cancel
   ```

9. **Verify Stock Restored** in database

### Edge Cases to Test

1. **Insufficient Stock**
   - Add items to cart with quantity > stock
   - Try to create order
   - Should fail with clear error message

2. **Invalid Payment Signature**
   - Create order
   - Send verify-payment with invalid signature
   - Should reject payment

3. **Empty Cart**
   - Clear cart
   - Try to create order
   - Should fail with "Cart is empty"

4. **Concurrent Orders**
   - Two users try to buy last item simultaneously
   - One should succeed, one should fail

5. **Order Cancellation**
   - Cancel order with delivered status
   - Should fail

## Environment Variables

Required in `.env`:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_uri
```

## Common Issues & Solutions

### Issue: Order created without payment
**Cause**: Signature verification bypassed  
**Solution**: Ensure signature verification is never commented out

### Issue: Stock oversold
**Cause**: Race condition  
**Solution**: Use MongoDB transactions (already implemented)

### Issue: Cart cleared before payment
**Cause**: Wrong order of operations  
**Solution**: Clear cart only after payment verification

### Issue: Stock not restored on cancellation
**Cause**: Transaction failed  
**Solution**: Check MongoDB transaction support, check logs

## Production Checklist

- [ ] Use real Razorpay credentials
- [ ] Set strong JWT_SECRET
- [ ] Enable MongoDB transactions (requires replica set)
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS
- [ ] Configure proper CORS
- [ ] Set up error monitoring
- [ ] Set up logging
- [ ] Test payment flow thoroughly
- [ ] Test stock management edge cases
- [ ] Load test concurrent orders

## Support

For issues or questions:
1. Check logs for error messages
2. Verify environment variables are set
3. Ensure MongoDB supports transactions
4. Check Razorpay dashboard for payment status
5. Review SECURITY_SUMMARY.md for best practices

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [MongoDB Transactions](https://docs.mongodb.com/manual/core/transactions/)
- [Payment Security Best Practices](https://owasp.org/www-community/vulnerabilities/)
