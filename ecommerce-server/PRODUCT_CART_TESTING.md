# Product and Cart API Testing Guide

This guide provides step-by-step instructions for testing the Product CRUD and Cart functionality.

## Prerequisites

1. **Server Running**: Start the server with `npm start` in the ecommerce-server directory
2. **Admin User**: Create an admin user following the TESTING.md guide
3. **Customer User**: Have at least one customer user for cart testing
4. **API Tool**: Use Postman, Insomnia, or cURL

## Environment Variables

Ensure your `.env` file has:
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## Product API Tests

### 1. Create Product (Admin Only)

**Endpoint**: `POST /api/products`  
**Authorization**: Bearer Token (Admin)

Using cURL with image upload:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -F "title=Laptop Pro 15" \
  -F "description=High-performance laptop with 16GB RAM and 512GB SSD" \
  -F "price=1299.99" \
  -F "discount=10" \
  -F "stock=50" \
  -F "category=Electronics" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

Using Postman:
- Method: POST
- URL: `http://localhost:5000/api/products`
- Headers: `Authorization: Bearer ADMIN_TOKEN_HERE`
- Body: form-data
  - title: "Laptop Pro 15"
  - description: "High-performance laptop"
  - price: 1299.99
  - discount: 10
  - stock: 50
  - category: "Electronics"
  - images: [file] (select image files)

**Expected Response** (Status: 201):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Laptop Pro 15",
    "description": "High-performance laptop",
    "price": 1299.99,
    "discount": 10,
    "stock": 50,
    "category": "Electronics",
    "images": ["https://res.cloudinary.com/..."],
    "ratings": {
      "average": 0,
      "count": 0
    },
    "finalPrice": 1169.99,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the product ID** for subsequent tests!

---

### 2. Get All Products (Public)

**Endpoint**: `GET /api/products`  
**Authorization**: None (Public)

Basic request:
```bash
curl http://localhost:5000/api/products
```

With search and filters:
```bash
curl "http://localhost:5000/api/products?search=laptop&category=Electronics&minPrice=500&maxPrice=2000&page=1&limit=10&sort=-price"
```

**Query Parameters**:
- `search`: Search in title and description
- `category`: Filter by category (Electronics, Fashion, Home, Books, Sports, Other)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 50)
- `sort`: Sort by (price, -price, createdAt, -createdAt, ratings, -ratings)

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

---

### 3. Get Product by ID (Public)

**Endpoint**: `GET /api/products/:id`  
**Authorization**: None (Public)

```bash
curl http://localhost:5000/api/products/PRODUCT_ID_HERE
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Laptop Pro 15",
    "price": 1299.99,
    "finalPrice": 1169.99,
    ...
  }
}
```

---

### 4. Update Product (Admin Only)

**Endpoint**: `PUT /api/products/:id`  
**Authorization**: Bearer Token (Admin)

```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -F "price=1199.99" \
  -F "stock=45" \
  -F "images=@/path/to/new-image.jpg"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "price": 1199.99,
    "stock": 45,
    ...
  }
}
```

---

### 5. Delete Product (Admin Only)

**Endpoint**: `DELETE /api/products/:id`  
**Authorization**: Bearer Token (Admin)

```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 6. Validation Tests

**Missing Required Fields**:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Product"}'
```

**Expected**: 400 error with validation messages

**Invalid Category**:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "price": 100,
    "stock": 10,
    "category": "InvalidCategory"
  }'
```

**Expected**: 400 error about invalid category

---

## Cart API Tests

### 1. Add to Cart

**Endpoint**: `POST /api/cart`  
**Authorization**: Bearer Token (Customer)

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [
      {
        "productId": {
          "_id": "...",
          "title": "Laptop Pro 15",
          "price": 1299.99,
          "discount": 10,
          "images": ["..."],
          "stock": 50,
          "finalPrice": 1169.99
        },
        "quantity": 2,
        "addedAt": "..."
      }
    ],
    "updatedAt": "..."
  }
}
```

---

### 2. Get Cart

**Endpoint**: `GET /api/cart`  
**Authorization**: Bearer Token (Customer)

```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "total": 2339.98,
    "updatedAt": "..."
  }
}
```

---

### 3. Update Cart Item

**Endpoint**: `PUT /api/cart`  
**Authorization**: Bearer Token (Customer)

```bash
curl -X PUT http://localhost:5000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 3
  }'
```

**Note**: Setting quantity to 0 will remove the item.

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    ...
    "items": [
      {
        "quantity": 3,
        ...
      }
    ]
  }
}
```

---

### 4. Remove from Cart

**Endpoint**: `DELETE /api/cart/:productId`  
**Authorization**: Bearer Token (Customer)

```bash
curl -X DELETE http://localhost:5000/api/cart/PRODUCT_ID_HERE \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    ...
    "items": []
  }
}
```

---

### 5. Clear Cart

**Endpoint**: `DELETE /api/cart/clear`  
**Authorization**: Bearer Token (Customer)

```bash
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [],
    "updatedAt": "..."
  }
}
```

---

### 6. Stock Validation Tests

**Add more than available stock**:
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 999999
  }'
```

**Expected**: 400 error with "Insufficient stock" message

**Add to cart with non-existent product**:
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "000000000000000000000000",
    "quantity": 1
  }'
```

**Expected**: 404 error with "Product not found" message

---

## Authorization Tests

### Admin-Only Access Test

**Try to create product as customer**:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "price": 100,
    "stock": 10,
    "category": "Electronics"
  }'
```

**Expected**: 403 error with "User role 'customer' is not authorized"

---

### Unauthenticated Cart Access

**Try to access cart without token**:
```bash
curl http://localhost:5000/api/cart
```

**Expected**: 401 error with "Not authorized to access this route"

---

## Complete Test Scenarios

### Scenario 1: Shopping Flow

1. Customer searches for products: `GET /api/products?search=laptop`
2. Customer views product details: `GET /api/products/:id`
3. Customer adds product to cart: `POST /api/cart`
4. Customer views cart: `GET /api/cart`
5. Customer updates quantity: `PUT /api/cart`
6. Customer proceeds to checkout (next milestone)

### Scenario 2: Admin Product Management

1. Admin creates product with images: `POST /api/products`
2. Admin lists all products: `GET /api/products`
3. Admin updates product details: `PUT /api/products/:id`
4. Admin deletes product: `DELETE /api/products/:id`

### Scenario 3: Stock Validation

1. Create product with stock=5
2. Add 3 items to cart (should succeed)
3. Try to add 5 more items (should fail - insufficient stock)
4. Update cart to 5 items (should succeed)
5. Try to update cart to 10 items (should fail)

---

## Expected Test Results Summary

| Test | Endpoint | Method | Auth | Expected Status |
|------|----------|--------|------|-----------------|
| Create Product | /api/products | POST | Admin | 201 |
| Get Products | /api/products | GET | Public | 200 |
| Get Product by ID | /api/products/:id | GET | Public | 200 |
| Update Product | /api/products/:id | PUT | Admin | 200 |
| Delete Product | /api/products/:id | DELETE | Admin | 200 |
| Add to Cart | /api/cart | POST | Customer | 200 |
| Get Cart | /api/cart | GET | Customer | 200 |
| Update Cart | /api/cart | PUT | Customer | 200 |
| Remove from Cart | /api/cart/:productId | DELETE | Customer | 200 |
| Clear Cart | /api/cart/clear | DELETE | Customer | 200 |
| Customer creates product | /api/products | POST | Customer | 403 |
| Unauthenticated cart | /api/cart | GET | None | 401 |
| Invalid stock | /api/cart | POST | Customer | 400 |

---

## Troubleshooting

### Cloudinary Upload Failed
- Verify Cloudinary credentials in .env
- Check image file size (max 5MB)
- Ensure file is a valid image format

### Product Search Not Working
- MongoDB text index may need time to build
- Try restarting MongoDB
- Check if search query is properly URL-encoded

### Cart Total Incorrect
- Ensure product has correct price and discount
- Check if virtuals are enabled in populate query
- Verify calculateTotal method is being called

### Stock Validation Not Working
- Check if stock is correctly set in product
- Verify stockValidator is imported in controller
- Ensure validation runs before cart update

---

**Happy Testing! 🚀**

## Next Steps

After successful testing:
1. ✅ All product endpoints functional
2. ✅ All cart endpoints functional
3. ✅ Authentication and authorization working
4. ✅ Image uploads to Cloudinary working
5. ✅ Stock validation active
6. ✅ Search and pagination working

Ready for **Milestone 3: Orders & Payment Integration**
