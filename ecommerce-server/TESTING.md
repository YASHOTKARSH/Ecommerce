# Testing Guide

This guide provides step-by-step instructions for testing all backend functionality.

## Prerequisites

1. **MongoDB**: Install and run MongoDB locally or use MongoDB Atlas
2. **Node.js**: Version 14.x or higher
3. **API Testing Tool**: Postman, Insomnia, or cURL

## Setup

1. **Navigate to server directory**:
   ```bash
   cd ecommerce-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your values**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-key-min-32-chars
   # Add other values as needed
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

   You should see:
   ```
   Server is running on port 5000
   MongoDB Connected: localhost
   ```

## Test Cases

### 1. Health Check
**Verify server is running**

```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### 2. User Registration
**Create a new user account**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response** (Status: 201):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Save the token** for subsequent requests!

---

### 3. Validation Test - Registration with Missing Fields
**Test input validation**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User"
  }'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": "\"email\" is required, \"password\" is required"
}
```

---

### 4. Validation Test - Invalid Email
**Test email format validation**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": "\"email\" must be a valid email"
}
```

---

### 5. Duplicate Registration
**Test duplicate email prevention**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": "User already exists with this email"
}
```

---

### 6. User Login
**Authenticate an existing user**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 7. Login with Wrong Password
**Test password verification**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response** (Status: 401):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 8. Login with Non-existent User
**Test user existence check**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```

**Expected Response** (Status: 401):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 9. Get Current User (Protected Route)
**Verify JWT authentication works**

Replace `YOUR_TOKEN_HERE` with the token from login/registration:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "country": ""
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 10. Access Protected Route Without Token
**Test authentication requirement**

```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Expected Response** (Status: 401):
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

---

### 11. Access Protected Route with Invalid Token
**Test token verification**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response** (Status: 401):
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

---

### 12. General Protected Route Test
**Test another protected endpoint**

```bash
curl -X GET http://localhost:5000/api/auth/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "You have access to this protected route",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 13. Admin Route with Customer Role
**Test role-based authorization (should fail)**

```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response** (Status: 403):
```json
{
  "success": false,
  "error": "User role 'customer' is not authorized to access this route"
}
```

---

### 14. Create Admin User and Test Admin Route
**Manual steps to test admin access**

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "admin123"
     }'
   ```

2. **Update role in MongoDB**:
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to ecommerce database
   use ecommerce
   
   # Update user role to admin
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Login as admin**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "admin123"
     }'
   ```
   
   Save the admin token!

4. **Access admin route**:
   ```bash
   curl -X GET http://localhost:5000/api/auth/admin-only \
     -H "Authorization: Bearer ADMIN_TOKEN_HERE"
   ```

   **Expected Response** (Status: 200):
   ```json
   {
     "success": true,
     "message": "You have admin access",
     "user": {
       "id": "507f1f77bcf86cd799439012",
       "name": "Admin User",
       "email": "admin@example.com",
       "role": "admin"
     }
   }
   ```

---

## Testing with Postman

### Setup Postman Collection

1. **Create a new collection**: "E-commerce API"

2. **Add environment variables**:
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set automatically)

3. **Create requests** for each endpoint above

4. **Set up Tests** to save token automatically:
   ```javascript
   // In registration/login request tests
   if (pm.response.code === 200 || pm.response.code === 201) {
     const response = pm.response.json();
     pm.environment.set("token", response.token);
   }
   ```

5. **Set Authorization** for protected routes:
   - Type: Bearer Token
   - Token: `{{token}}`

---

## Expected Test Results Summary

| Test | Expected Status | Expected Result |
|------|----------------|-----------------|
| Health Check | 200 | Server running message |
| User Registration | 201 | User created with token |
| Missing Fields | 400 | Validation error |
| Invalid Email | 400 | Validation error |
| Duplicate Email | 400 | User exists error |
| User Login | 200 | Token and user data |
| Wrong Password | 401 | Invalid credentials |
| Non-existent User | 401 | Invalid credentials |
| Get Current User | 200 | User profile data |
| No Token | 401 | Not authorized |
| Invalid Token | 401 | Not authorized |
| Protected Route | 200 | Access granted |
| Admin Route (Customer) | 403 | Forbidden |
| Admin Route (Admin) | 200 | Access granted |

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env file
- Try: `mongodb://127.0.0.1:27017/ecommerce`

### Server Won't Start
- Check if port 5000 is available
- Verify all dependencies installed: `npm install`
- Check .env file exists and has JWT_SECRET

### 500 Server Error
- Check server logs for detailed error
- Verify MongoDB connection
- Ensure JWT_SECRET is set

### Rate Limiting
If you get "Too many requests" error:
- Wait 15 minutes
- Or restart the server (rate limit resets)

---

## Next Steps

After completing all tests:
1. ✅ All endpoints working
2. ✅ Authentication functional
3. ✅ Authorization working
4. ✅ Validation active
5. ✅ Error handling correct

The backend is ready for:
- Product management implementation
- Cart and order features
- Payment integration
- Additional middleware

---

**Happy Testing! 🚀**
