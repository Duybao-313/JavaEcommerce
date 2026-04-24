# End-to-End Token Refresh Testing Guide

**Date:** April 24, 2026  
**Purpose:** Verify backend auth flow and frontend refresh integration  

---

## 🎯 Quick Start Testing

### Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000` (Vite dev server)
- MySQL database populated with test users
- Browser DevTools available

### Demo Test Accounts
```
Admin:
  Username: admin
  Password: admin

User:
  Username: user
  Password: user

Seller:
  Username: seller
  Password: seller
```

---

## ✅ Test Scenario 1: Complete Login & Token Storage

**Goal:** Verify tokens are stored correctly after login

### Steps:
1. Open browser DevTools (F12) → Application → localStorage
2. Visit http://localhost:3000
3. Click login or navigate to `/login`
4. Enter credentials: `admin` / `admin`
5. Click "Đăng nhập" button

### Expected Results:

#### Console Output:
```javascript
// Should see successful response
{
  success: true,
  code: 200,
  message: "Đăng nhập thành công",
  data: {
    jwt: "eyJhbGciOiJIUzUxMiJ9...",
    role: "ROLE_ADMIN",
    a: {
      id: 1,
      username: "admin",
      fullName: "Admin User",
      email: "admin@example.com"
    }
  }
}
```

#### localStorage Keys:

| Key | Value | Example |
|-----|-------|---------|
| `splitgo_token` | JWT string | `eyJhbGciOiJIUzUxMiJ9...` |
| `splitgo_refresh_token` | JWT string (same) | `eyJhbGciOiJIUzUxMiJ9...` |
| `splitgo_auth` | JSON object | `{"jwt":"...","role":"ROLE_ADMIN","a":{...}}` |

#### UI:
```
✓ Should navigate to /products
✓ Header should show "Admin" badge
✓ Should display user avatar (initial "A")
✓ Toast should show success message
```

### Verification:
```javascript
// In browser console, type:
JSON.parse(localStorage.getItem('splitgo_auth'))
// Should output full auth object with user details
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 2: Authenticated Request (Add to Cart)

**Goal:** Verify Authorization header is sent with protected requests

### Steps:
1. ✅ Complete Test Scenario 1 (be logged in)
2. Navigate to `/products`
3. Find any product and click "Xem chi tiết"
4. Set quantity to 2
5. Open DevTools → Network tab
6. Click "Thêm vào giỏ hàng"

### Expected Results:

#### Network Request:
```
Request URL: http://localhost:3000/api/cart/items
Request Method: POST
Request Headers:
  ├─ Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...  ✓ SHOULD BE PRESENT
  ├─ Content-Type: application/json
  └─ ...other headers
Request Body:
  {
    "productId": 1,
    "quantity": 2
  }

Response Status: 200 OK ✓
Response Body:
  {
    "success": true,
    "code": 200,
    "message": "Thêm sản phẩm vào giỏ hàng thành công",
    "data": {...}
  }
```

#### UI:
```
✓ Toast should show "Đã thêm vào giỏ hàng"
✓ Quantity field should reset to 1
✓ No error messages
```

### Debugging:
```javascript
// Check if token is present properly
getStoredToken()  // Should return JWT string

// Check if authFetch adds header
const response = await authFetch('/api/cart')
// Check response tab in DevTools for Authorization header
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 3: Auto-Refresh on 401

**Goal:** Verify token refresh happens automatically when token expires

### Setup:
1. ✅ Complete Test Scenario 1 (be logged in)
2. Open DevTools → Application → localStorage
3. Edit the `splitgo_token` value

### Test Method A: Corrupt Token (Fast)

**Steps:**
1. Copy `splitgo_token` value
2. Add "INVALID" to the end: `eyJhbGc...INVALID`
3. Save modified token to localStorage
4. Open DevTools → Network → Filter requests containing "refresh"
5. Navigate to `/products` and click on a product
6. Click "Thêm vào giỏ hàng"

**Expected Results:**

#### Network Activity:
```
Request 1: POST /api/cart/items
  ├─ Authorization: Bearer eyJhbGc...INVALID
  ├─ Response: 401 Unauthorized (token invalid)
  └─ Trigger: Frontend detects 401

Request 2: POST /api/auth/refresh ← AUTO TRIGGERED
  ├─ Body: { token: "eyJhbGc...INVALID" }
  ├─ Response: 200 OK
  ├─ Data: { token: "eyJhbGc...NEW", expiryDate: "..." }
  └─ Side effect: splitgo_token updated in localStorage

Request 3: POST /api/cart/items (RETRY)
  ├─ Authorization: Bearer eyJhbGc...NEW  ← NEW TOKEN
  ├─ Response: 200 OK ✓
  └─ Success!
```

#### Console Logs (if debugging enabled):
```
[DEBUG] Original request failed with 401
[DEBUG] Calling refreshAuthToken()
[DEBUG] New token received: eyJhbGc...NEW
[DEBUG] Retrying request with new token
[DEBUG] Request succeeded
```

#### UI:
```
✓ May see brief loading state
✓ Toast should show success
✓ Cart item added successfully
✓ localStorage updated with new token
```

### Test Method B: Pre-expired Token (Realistic)

**Only if you can modify backend token duration temporarily:**

1. Set `jwt.token-duration: 10` (10 seconds) in application.yaml
2. Restart backend
3. Login to generate 10-second token
4. Wait 11 seconds
5. Try to add to cart
6. Should trigger auto-refresh

**Expected:** Same as Test Method A

### Inspect localStorage After:
```javascript
// In console:
const newToken = getStoredToken()
// Compare with old token - should be DIFFERENT
// Should have 100 minutes validity from now
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 4: Refresh Window Exceeded (Re-login Required)

**Goal:** Verify that requests fail after refresh window closes

**Note:** Requires 16.67+ hours or mocking time. Alternative: Use curl with claims.

### Prerequisites:
Setup a token that's beyond refresh window manually, OR use backend test endpoint.

### Method: Manual Token Inspection

**Steps:**
1. Get a token from login
2. Decode JWT (use https://jwt.io)
3. Note `iat` and `exp` values
4. Understand: Frontend can only refresh if: `now - iat < 60000` seconds

### Verification via Backend Test:
```bash
# Test with old token (manually set iat to >16 hours ago)
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGc..."}'

# If "now - iat > 60000" seconds:
Response: 401 Unauthorized
Message: "Token khong hop le" or "TOKEN_INVALID"
```

### Expected Frontend Behavior:

If refresh fails:
```
authFetch() calls refreshAuthToken()
  ↓
POST /auth/refresh returns 401
  ↓
Front catches error
  ↓
Either:
  - Retries with old token (fails again)
  - Throws error to component
  - Component redirects to /login
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 5: Get User Detail (Protected Endpoint)

**Goal:** Verify protected endpoints work with token

### Steps:
1. ✅ Complete Test Scenario 1 (be logged in)
2. Navigate to `/me` (UserProfilePage)
3. Open DevTools → Network tab

### Expected Results:

#### Network Request:
```
Request URL: http://localhost:3000/api/auth/userdetail
Request Method: GET
Request Headers:
  ├─ Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...  ✓
  └─ ...other headers

Response Status: 200 OK
Response Body:
  {
    "success": true,
    "code": 200,
    "message": "Lấy thông tin người dùng",
    "data": {
      "id": 1,
      "username": "admin",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "phone": "+84...",
      "address": "123 Street",
      "role": "ROLE_ADMIN",
      "status": "ACTIVE",
      "createdAt": "2026-04-18T...",
      "updatedAt": "2026-04-18T..."
    }
  }
```

#### UI:
```
✓ Page displays user information
✓ Avatar shown with initials or image
✓ All fields populated:
  - Email
  - Role
  - Phone (if available)
  - Address (if available)
✓ Logout button present and clickable
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 6: Logout Flow

**Goal:** Verify logout clears tokens and invalidates session

### Steps:
1. ✅ Be logged in (complete Test Scenario 1)
2. Note current token value from localStorage
3. Navigate to `/me`
4. Click "Đăng xuất" button
5. Open DevTools → Application → localStorage

### Expected Results:

#### localStorage After Logout:
```
✓ splitgo_token: REMOVED
✓ splitgo_refresh_token: REMOVED  
✓ splitgo_auth: REMOVED
```

#### Navigation:
```
✓ Should redirect to /login page
✓ Toast should show "Đã đăng xuất"
```

#### Backend Side Effect:
```
- Old token added to InvalidatedToken table
- Subsequent requests with that token return 401
```

### Verify Backend Invalidation:
```bash
# Try to use old token after logout
curl -X GET http://localhost:8080/auth/userdetail \
  -H "Authorization: Bearer {old_token_from_test}"

# Should fail with 401 Unauthorized
# Message should indicate token is invalid/blacklisted
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## ✅ Test Scenario 7: Demo Accounts Quick Fill

**Goal:** Verify demo account buttons work

### Steps:
1. Navigate to `/login`
2. Click "Admin" button (or User, or Seller)
3. Check form fields are auto-filled

### Expected Results:

#### Admin Button:
```
username: admin
password: admin
```

#### User Button:
```
username: user
password: user
```

#### Seller Button:
```
username: seller
password: seller
```

#### After Click "Đăng nhập":
```
✓ Should show success toast
✓ Should store token in localStorage
✓ Should navigate to /products or similar
✓ Should show user badge with role indication
```

**Mark as:** [✅] PASS / [❌] FAIL

---

## 🔍 Troubleshooting

### Problem: 401 on login (credentials not accepted)

**Check:**
```bash
# Test backend directly
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# If fails: backend user not created or password wrong
# Check database:
SELECT * FROM users WHERE username='admin';
```

### Problem: Cart request fails with 401 even after login

**Check:**
1. Open DevTools → Network → Find cart request
2. Look for Authorization header
   - If MISSING: `authFetch` not used
   - If INVALID JWT: Token corrupted in storage

**Solution:**
```javascript
// In console:
getStoredToken()  // Should output JWT string
// If empty: Not logged in properly
// If corrupted: Clear localStorage and re-login
```

### Problem: Token refresh not triggering

**Check:**
1. Confirm first request returns 401
   - DevTools → Network tab → First request response
   - Should be status 401

2. Confirm `/auth/refresh` endpoint is called
   - Filter Network to "refresh"
   - Should see POST /api/auth/refresh request

3. Confirm refresh succeeds
   - `/auth/refresh` response should be 200
   - Response body should have new token

**If refresh returns 401:**
```
Reason 1: Token beyond refresh window
  → User must login again

Reason 2: Token was already invalidated
  → Clear storage and login again
```

### Problem: User info not showing on /me page

**Check:**
1. Are you logged in?
   - Check localStorage has splitgo_token

2. Does network request succeed?
   - DevTools → GET /api/auth/userdetail
   - Response code should be 200

3. Is token valid?
   - Try getting data: authFetch('/api/auth/userdetail')
   - Check response in console

---

## 📊 Test Results Checklist

Copy and fill in:

```
╔════════════════════════════════════════════════════════════════╗
║ END-TO-END TOKEN REFRESH TESTING RESULTS                      ║
╠════════════════════════════════════════════════════════════════╣
║ Date: ________________                                         ║
║ Tester: ________________                                       ║
║ Backend Version: ________________                              ║
║ Frontend Version: ________________                             ║
╠════════════════════════════════════════════════════════════════╣
║ Test Scenario Results:                                         ║
║                                                                ║
║ [  ] Test 1: Login & Token Storage                       PASS  ║
║ [  ] Test 2: Authenticated Request (Cart)                PASS  ║
║ [  ] Test 3: Auto-Refresh on 401                         PASS  ║
║ [  ] Test 4: Refresh Window Exceeded                     PASS  ║
║ [  ] Test 5: Protected Endpoint (UserDetail)             PASS  ║
║ [  ] Test 6: Logout Flow                                 PASS  ║
║ [  ] Test 7: Demo Accounts                               PASS  ║
║                                                                ║
║ Overall Status: [  ] ALL PASS  [  ] SOME ISSUES              ║
╠════════════════════════════════════════════════════════════════╣
║ Issues Found:                                                  ║
║                                                                ║
║ 1. ________________________________________________________________
║                                                                ║
║ 2. ________________________________________________________________
║                                                                ║
║ 3. ________________________________________________________________
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║ Notes:                                                         ║
║ __________________________________________________________________
║ __________________________________________________________________
║ __________________________________________________________________
╚════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Performance Testing (Optional)

### Measure Refresh Time

```javascript
// In browser console:
performance.mark('refresh-start')
await refreshAuthToken()
performance.mark('refresh-end')
performance.measure('refresh', 'refresh-start', 'refresh-end')
performance.getEntriesByName('refresh')[0].duration

// Expected: 50-200ms depending on network
```

### Measure Auto-Refresh on Concurrent Requests

```javascript
// Corrupt token
const token = getStoredToken()
localStorage.setItem('splitgo_token', token + 'XXX')

// Fire 5 concurrent requests
performance.mark('start')
await Promise.all([
  authFetch('/api/cart'),
  authFetch('/api/cart'),
  authFetch('/api/cart'),
  authFetch('/api/cart'),
  authFetch('/api/cart'),
])
performance.mark('end')
performance.measure('concurrent-refresh', 'start', 'end')
performance.getEntriesByName('concurrent-refresh')[0].duration

// Expected: All should succeed
// Check network tab: 1 refresh call + 5 retries (potential for 5 concurrent refresh calls)
```

---

## Summary

**All ✅ tests passing?**
→ Authentication system is fully functional! ✨

**Some ❌ tests failing?**
→ Debug using troubleshooting section above

**Questions?**
→ Refer to `BACKEND_AUTH_FLOW_ANALYSIS.md` and `FRONTEND_REFRESH_VERIFICATION.md`


