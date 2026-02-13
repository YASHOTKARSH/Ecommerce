# Admin Dashboard API Documentation

This document provides comprehensive documentation for the admin dashboard API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Order Management](#order-management)
- [Product Management](#product-management)
- [Analytics & Dashboard](#analytics--dashboard)
- [Security](#security)
- [Testing](#testing)

## Overview

The Admin Dashboard provides a comprehensive set of APIs for managing users, orders, products, and viewing analytics. All admin endpoints are protected and require:

1. Valid JWT authentication token
2. Admin role authorization

**Base URL**: `/api/admin`

## Authentication

All admin routes require:
- **Authentication**: Valid JWT token in `Authorization: Bearer <token>` header or in cookies
- **Authorization**: User must have `role: 'admin'`

### Example Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## User Management

### Get All Users

Get a paginated list of all users with optional filters.

**Endpoint**: `GET /api/admin/users`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (admin/customer)

**Example Request**:
```
GET /api/admin/users?page=1&limit=10&search=john&role=customer
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isBanned": false,
      "lastLogin": "2024-02-13T10:30:00.000Z",
      "createdAt": "2024-01-15T08:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Get User by ID

Get detailed information about a specific user.

**Endpoint**: `GET /api/admin/users/:id`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "isBanned": false,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "lastLogin": "2024-02-13T10:30:00.000Z",
    "createdAt": "2024-01-15T08:20:00.000Z"
  }
}
```

### Update User Role

Update a user's role (customer ↔ admin).

**Endpoint**: `PUT /api/admin/users/:id/role`

**Request Body**:
```json
{
  "role": "admin"
}
```

**Validation**:
- `role`: Required, must be "customer" or "admin"

**Success Response** (200):
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Ban/Unban User

Toggle a user's ban status. Banned users cannot log in.

**Endpoint**: `PUT /api/admin/users/:id/ban`

**Success Response** (200):
```json
{
  "success": true,
  "message": "User banned successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "isBanned": true
  }
}
```

**Note**: Admins cannot ban themselves.

### Delete User

Permanently delete a user account.

**Endpoint**: `DELETE /api/admin/users/:id`

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note**: Admins cannot delete their own account.

## Order Management

### Get All Orders

Get a paginated list of all orders with filters.

**Endpoint**: `GET /api/admin/orders`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status (processing, confirmed, shipped, delivered, cancelled)
- `paymentStatus` (optional): Filter by payment status (pending, completed, failed, refunded)
- `search` (optional): Search by order ID or user email

**Example Request**:
```
GET /api/admin/orders?page=1&limit=10&status=processing&paymentStatus=completed
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "user": {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "_id": "60d5ec49f1b2c72b8c8e4f1c",
            "title": "Laptop",
            "category": "Electronics"
          },
          "title": "Laptop",
          "price": 999.99,
          "quantity": 1
        }
      ],
      "orderStatus": "processing",
      "paymentStatus": "completed",
      "totalAmount": 999.99,
      "createdAt": "2024-02-13T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 450,
    "pages": 45
  }
}
```

### Get Order by ID

Get detailed information about a specific order.

**Endpoint**: `GET /api/admin/orders/:id`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "user": {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York"
      }
    },
    "items": [...],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "orderStatus": "processing",
    "paymentStatus": "completed",
    "paymentMethod": "card",
    "totalAmount": 999.99,
    "createdAt": "2024-02-13T10:30:00.000Z",
    "updatedAt": "2024-02-13T10:30:00.000Z"
  }
}
```

### Update Order Status

Update the status of an order with validation for proper status transitions.

**Endpoint**: `PUT /api/admin/orders/:id/status`

**Request Body**:
```json
{
  "orderStatus": "shipped"
}
```

**Valid Status Transitions**:
- `processing` → `confirmed`, `cancelled`
- `confirmed` → `shipped`, `cancelled`
- `shipped` → `delivered`
- `delivered` → (final state)
- `cancelled` → (final state)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "orderStatus": "shipped",
    "user": {...},
    "items": [...]
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Cannot transition from delivered to processing"
}
```

### Update Payment Status

Update the payment status of an order. If refunded, stock is automatically restored.

**Endpoint**: `PUT /api/admin/orders/:id/payment-status`

**Request Body**:
```json
{
  "paymentStatus": "refunded"
}
```

**Valid Payment Statuses**:
- `pending`: Payment not yet received
- `completed`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded (restores stock)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "paymentStatus": "refunded",
    "user": {...},
    "items": [...]
  }
}
```

## Product Management

### Get Product Statistics

Get comprehensive product statistics and inventory information.

**Endpoint**: `GET /api/admin/products/stats`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "lowStockProducts": 12,
    "outOfStockProducts": 3,
    "totalInventoryValue": 125000.50,
    "productsByCategory": [
      {
        "_id": "Electronics",
        "count": 45,
        "totalValue": 55000.00
      },
      {
        "_id": "Fashion",
        "count": 60,
        "totalValue": 35000.00
      }
    ]
  }
}
```

### Bulk Update Products

Update multiple products in a single request.

**Endpoint**: `PUT /api/admin/products/bulk-update`

**Request Body**:
```json
{
  "updates": [
    {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "updates": {
        "price": 899.99,
        "stock": 50
      }
    },
    {
      "id": "60d5ec49f1b2c72b8c8e4f1b",
      "updates": {
        "discount": 15
      }
    }
  ]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Bulk update completed",
  "results": [
    {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "success": true,
      "message": "Product updated successfully",
      "data": {...}
    },
    {
      "id": "60d5ec49f1b2c72b8c8e4f1b",
      "success": true,
      "message": "Product updated successfully",
      "data": {...}
    }
  ]
}
```

### Bulk Delete Products

Delete multiple products and their Cloudinary images.

**Endpoint**: `DELETE /api/admin/products/bulk-delete`

**Request Body**:
```json
{
  "ids": [
    "60d5ec49f1b2c72b8c8e4f1a",
    "60d5ec49f1b2c72b8c8e4f1b"
  ]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "2 products deleted successfully",
  "deletedCount": 2
}
```

## Analytics & Dashboard

### Dashboard Overview

Get a comprehensive overview of the entire system with key metrics.

**Endpoint**: `GET /api/admin/dashboard`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalOrders": 450,
      "totalRevenue": 125000.50,
      "revenueToday": 5000.00,
      "revenueThisWeek": 25000.00,
      "revenueThisMonth": 85000.00,
      "ordersToday": 12,
      "ordersThisWeek": 85,
      "ordersThisMonth": 320,
      "newUsersToday": 3,
      "newUsersThisWeek": 18,
      "newUsersThisMonth": 45
    },
    "topProducts": [
      {
        "id": "60d5ec49f1b2c72b8c8e4f1a",
        "title": "Laptop Pro",
        "orderCount": 45,
        "revenue": 44999.55
      }
    ],
    "recentOrders": [...],
    "lowStockAlerts": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "title": "Wireless Mouse",
        "stock": 5,
        "category": "Electronics"
      }
    ]
  }
}
```

### Revenue Analytics

Get detailed revenue analytics with optional date range filtering.

**Endpoint**: `GET /api/admin/analytics/revenue`

**Query Parameters**:
- `startDate` (optional): ISO date string (e.g., "2024-01-01T00:00:00.000Z")
- `endDate` (optional): ISO date string

**Example Request**:
```
GET /api/admin/analytics/revenue?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "dailyRevenue": [
      {
        "date": "2024-02-01",
        "count": 15,
        "revenue": 12500.00
      }
    ],
    "monthlyRevenue": [
      {
        "date": "2024-01",
        "count": 320,
        "revenue": 85000.00
      }
    ],
    "revenueByCategory": {
      "Electronics": 55000.00,
      "Fashion": 35000.00,
      "Home": 20000.00
    },
    "totalRevenue": 125000.50
  }
}
```

### Order Analytics

Get comprehensive order analytics including status distribution and trends.

**Endpoint**: `GET /api/admin/analytics/orders`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "statusDistribution": [
      {
        "_id": "delivered",
        "count": 320
      },
      {
        "_id": "processing",
        "count": 85
      },
      {
        "_id": "shipped",
        "count": 45
      }
    ],
    "ordersOverTime": [
      {
        "date": "2024-02-01",
        "count": 15,
        "revenue": 12500.00
      }
    ],
    "averageOrderValue": 277.78,
    "completionRate": 71.11
  }
}
```

### User Analytics

Get user growth and engagement analytics.

**Endpoint**: `GET /api/admin/analytics/users`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "registrationOverTime": [
      {
        "date": "2024-02-01",
        "count": 5
      }
    ],
    "activeUsers": 95,
    "roleDistribution": [
      {
        "_id": "customer",
        "count": 145
      },
      {
        "_id": "admin",
        "count": 5
      }
    ],
    "totalUsers": 150
  }
}
```

## Security

### Authentication & Authorization

All admin endpoints enforce:
1. **JWT Authentication**: Valid token required
2. **Role-Based Access**: Only users with `role: 'admin'` can access
3. **Self-Protection**: Admins cannot delete or ban themselves

### Input Validation

All endpoints use Joi validation schemas:
- User role updates
- Order status transitions
- Payment status updates
- Bulk operations
- Date ranges

### Ban System

When a user is banned:
- `isBanned` field is set to `true`
- User cannot log in (checked during authentication)
- Existing tokens remain valid until expiry
- User receives "account banned" error message

### Status Transition Validation

Order status changes follow strict rules:
- Cannot skip states (e.g., processing → delivered)
- Cannot reverse to previous states
- Final states (delivered, cancelled) cannot be changed

### Stock Management

When refunding an order:
- Stock is automatically restored for all products
- Only happens when transitioning to "refunded" status
- Prevents over-refunding (checks current status)

## Testing

### Manual Testing

1. **Start the server**:
   ```bash
   cd ecommerce-server
   npm start
   ```

2. **Create admin user**:
   - Register a user via `/api/auth/register`
   - Update user role in database:
     ```javascript
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

3. **Get admin token**:
   - Login via `/api/auth/login`
   - Use returned token for admin requests

4. **Test admin endpoints**:
   ```bash
   # Get all users
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/admin/users

   # Get dashboard
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/admin/dashboard

   # Update order status
   curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"orderStatus": "shipped"}' \
     http://localhost:5000/api/admin/orders/<order-id>/status
   ```

### Error Responses

**401 Unauthorized** (No token or invalid token):
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**403 Forbidden** (Not admin):
```json
{
  "success": false,
  "message": "User role 'customer' is not authorized to access this route"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request** (Validation error):
```json
{
  "success": false,
  "message": "Role must be either customer or admin"
}
```

## Utility Functions

### Analytics Helper

Located in `/utils/analyticsHelper.js`:
- `calculateRevenue(orders)`: Calculate total revenue from orders
- `groupByDate(orders, granularity)`: Group orders by day/week/month
- `getDateRange(period)`: Get start/end dates for period
- `calculateGrowthRate(current, previous)`: Calculate percentage change

### Export Helper

Located in `/utils/exportHelper.js`:
- `exportOrdersToCSV(orders)`: Convert orders to CSV format
- `exportUsersToCSV(users)`: Convert users to CSV format

## Best Practices

1. **Always use pagination** for list endpoints to prevent performance issues
2. **Filter data appropriately** to reduce response size
3. **Validate status transitions** before updating orders
4. **Check permissions** before bulk operations
5. **Log admin actions** for audit trail (future enhancement)
6. **Cache dashboard data** for frequently accessed metrics (future enhancement)

## Future Enhancements

- [ ] Audit logging for all admin actions
- [ ] Export endpoints for CSV downloads
- [ ] Email notifications for order status changes
- [ ] Real-time dashboard updates via WebSockets
- [ ] Advanced filtering and sorting options
- [ ] Batch processing for large operations
- [ ] Report generation (PDF/Excel)
- [ ] Activity timeline for users and orders
