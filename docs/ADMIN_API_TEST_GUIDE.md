# Admin Dashboard - API & Test Guide

## API Endpoints Summary

### Products

#### List All Products (Admin)
```http
GET /products/admin
Authorization: Bearer <token>
Role: ADMIN

Response: [
  {
    id: 1,
    name: "Laptop",
    price: 15000000,
    stock: 50,
    status: "ACTIVE",
    sellerId: 2,
    sellerUsername: "seller1",
    imageUrl: "https://example.com/laptop.jpg",
    createdAt: "2024-05-01T10:00:00"
  }
]
```

#### Create Product (Admin)
```http
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data
Role: ADMIN or SELLER

Body:
{
  name: "iPhone 15",
  description: "Latest iPhone",
  price: 25000000,
  stock: 100,
  categoryId: 5,
  ownerId: 3,  # (optional, admin can own product on behalf of seller)
  image: <file>
}

Response: { id: 15, name: "iPhone 15", ... }
```

#### Update Product (Admin)
```http
PUT /products/15
Authorization: Bearer <token>
Content-Type: application/json
Role: ADMIN or SELLER (if owner)

Body:
{
  name: "iPhone 15 Pro",
  price: 30000000,
  stock: 80,
  status: "ACTIVE"
}

Response: { id: 15, name: "iPhone 15 Pro", ... }
```

#### Delete Product (Admin)
```http
DELETE /products/15
Authorization: Bearer <token>
Role: ADMIN or SELLER (if owner)

Response: { success: true, message: "Product hidden successfully" }
```

---

### Orders

#### List All Orders (Admin)
```http
GET /orders
Authorization: Bearer <token>
Role: ADMIN

Response: [
  {
    orderId: 101,
    buyerId: 5,
    buyerUsername: "user1",
    status: "PENDING",
    totalAmount: 50000000,
    paymentMethod: "COD",
    shippingAddress: "123 Nguyen Hue, HCMC",
    items: [
      {
        orderItemId: 501,
        productId: 15,
        productName: "iPhone 15",
        sellerId: 2,
        sellerUsername: "seller1",
        quantity: 1,
        unitPrice: 25000000,
        lineTotal: 25000000
      }
    ],
    createdAt: "2024-05-05T14:00:00"
  }
]
```

#### Update Order Status (Admin/Seller)
```http
PATCH /orders/101/status
Authorization: Bearer <token>
Content-Type: application/json
Role: ADMIN or SELLER (if owns item)

Body:
{
  status: "DELIVERED"
}

Response:
{
  orderId: 101,
  status: "DELIVERED",
  # If status=DELIVERED, syncs to shipping:
  # - Shipping.status → DELIVERED
  # - Shipping.actualDelivery → NOW
}
```

Valid status transitions:
- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → PREPARING, CANCELLED
- PREPARING → SHIPPING, CANCELLED
- SHIPPING → DELIVERED
- DELIVERED → (terminal, cannot change)
- CANCELLED → (terminal, cannot change)

---

### Reviews

#### List All Reviews (Admin)
```http
GET /reviews/admin
Authorization: Bearer <token>
Role: ADMIN

Response: [
  {
    id: 201,
    productId: 15,
    productName: "iPhone 15",
    reviewerId: 5,
    reviewerName: "User 1",
    rating: 5,
    title: "Excellent phone!",
    comment: "Great display and camera",
    isApproved: false,
    createdAt: "2024-05-05T15:00:00"
  }
]
```

#### Approve Review (Admin)
```http
POST /reviews/201/approve
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  id: 201,
  isApproved: true,
  ...
}
```

#### Reject Review (Admin)
```http
POST /reviews/201/reject
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  id: 201,
  isApproved: false,
  ...
}
```

#### Delete Review (Admin/User)
```http
DELETE /reviews/201
Authorization: Bearer <token>
Role: ADMIN or USER (if reviewer)

Response: { success: true, message: "Review deleted successfully" }
```

---

### Shippings

#### List All Shippings (Admin/Seller)
```http
GET /shippings
Authorization: Bearer <token>
Role: ADMIN or SELLER

Response: [
  {
    id: 301,
    orderId: 101,
    trackingCode: "VN12345678",
    carrierName: "Viettel",
    status: "PENDING",
    estimatedDelivery: "2024-05-10T18:00:00",
    actualDelivery: null,
    createdAt: "2024-05-05T16:00:00"
  }
]
```

#### Create Shipping (Admin/Seller)
```http
POST /shippings
Authorization: Bearer <token>
Content-Type: application/json
Role: ADMIN or SELLER

Body:
{
  orderId: 101,
  carrierName: "Viettel",
  trackingCode: "VN12345678",
  estimatedDelivery: "2024-05-10T18:00:00"
}

Response: { id: 301, orderId: 101, status: "PENDING", ... }
```

#### Update Shipping (Admin/Seller)
```http
PUT /shippings/301
Authorization: Bearer <token>
Content-Type: application/json
Role: ADMIN or SELLER

Body:
{
  trackingCode: "VN12345678",
  carrierName: "Viettel",
  status: "IN_TRANSIT",
  estimatedDelivery: "2024-05-10T18:00:00"
}

Response: { id: 301, status: "IN_TRANSIT", ... }
```

#### Mark Shipping In Transit (Admin/Seller)
```http
POST /shippings/301/mark-in-transit
Authorization: Bearer <token>
Role: ADMIN or SELLER

Response: { success: true, message: "Marked as in transit successfully" }
```

#### Mark Shipping Delivered (Admin/Seller)
```http
POST /shippings/301/mark-delivered
Authorization: Bearer <token>
Role: ADMIN or SELLER

Response: { success: true, message: "Marked as delivered successfully" }
# Also sets Shipping.actualDelivery = NOW
```

#### Track Shipping (Admin/Seller)
```http
GET /shippings/track?trackingCode=VN12345678
Authorization: Bearer <token>
Role: ADMIN or SELLER

Response:
{
  id: 301,
  orderId: 101,
  trackingCode: "VN12345678",
  status: "IN_TRANSIT",
  ...
}
```

---

## Frontend API Usage Examples

### Admin Service - Products

```javascript
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "@/services/adminService";

// Fetch all products
const products = await getAdminProducts();

// Create new product
const formData = new FormData();
formData.append("name", "iPhone 15");
formData.append("price", 25000000);
formData.append("stock", 100);
formData.append("categoryId", 5);
formData.append("ownerId", 3); // optional
formData.append("image", fileObject);

const created = await createAdminProduct(formData);

// Update product
const updated = await updateAdminProduct(15, {
  name: "iPhone 15 Pro",
  price: 30000000,
  stock: 80,
});

// Delete product
await deleteAdminProduct(15);
```

### Admin Service - Orders

```javascript
import { getAdminOrders, updateOrderStatus } from "@/services/adminService";

// Fetch all orders
const orders = await getAdminOrders();

// Update order status
const updated = await updateOrderStatus(101, "DELIVERED");
// Automatically syncs shipping if exists
```

### Admin Service - Reviews

```javascript
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "@/services/adminService";

// List all reviews
const reviews = await getAdminReviews();

// Approve review
await approveReview(201);

// Reject review
await rejectReview(201);

// Delete review
await deleteReview(201);
```

### Admin Service - Shippings

```javascript
import {
  getShippings,
  createShipping,
  updateShipping,
  markShippingInTransit,
  markShippingDelivered,
  trackShipping,
  getShippingByOrderId,
} from "@/services/adminService";

// List all shippings
const shippings = await getShippings();

// Create shipping
const created = await createShipping({
  orderId: 101,
  carrierName: "Viettel",
  trackingCode: "VN12345678",
  estimatedDelivery: new Date("2024-05-10"),
});

// Update shipping
const updated = await updateShipping(301, {
  trackingCode: "VN12345679",
  carrierName: "GHN",
});

// Mark in transit
await markShippingInTransit(301);

// Mark delivered
await markShippingDelivered(301);

// Track by code
const result = await trackShipping("VN12345678");

// Get shipping by order
const shipping = await getShippingByOrderId(101);
```

---

## Test Cases

### 1. Admin Products - Create Product for Seller

**Preconditions**:
- User logged in as ADMIN
- Seller with ID 3 exists

**Steps**:
1. Navigate to /admin/products
2. Fill form:
   - Name: "Samsung Galaxy S24"
   - Price: 24000000
   - Stock: 50
   - Category: Electronics
   - Owner ID: 3
3. Upload image file
4. Click "Tao san pham"

**Expected Result**:
- Toast: "Tao san pham thanh cong"
- Product appears in table with seller = Seller #3
- Page resets form

---

### 2. Admin Orders - Update Status and Sync Shipping

**Preconditions**:
- Order #101 exists with status PENDING
- Shipping for order #101 exists with status PENDING

**Steps**:
1. Navigate to /admin/orders
2. Find order #101
3. Click status dropdown, select DELIVERED
4. Wait for toast confirmation

**Expected Result**:
- Order status changes to DELIVERED immediately
- Shipping status auto-syncs to DELIVERED
- Toast: "Cap nhat trang thai don hang thanh cong"

---

### 3. Admin Reviews - Approve and Delete

**Preconditions**:
- Review #201 exists with isApproved = false

**Steps**:
1. Navigate to /admin/reviews
2. Find Review #201
3. Click "Approve" button
4. Wait for toast

**Expected Result**:
- Review now shows status "approved"
- Can repeat with "Reject" to toggle back

**Then Delete**:
1. On same review, click "Delete"
2. Confirmation modal appears
3. Click "Xoa" button
4. Wait for toast

**Expected Result**:
- Review removed from table
- Toast: "Da xoa review"

---

### 4. Admin Shippings - Create and Track

**Preconditions**:
- Order #102 exists

**Steps**:
1. Navigate to /admin/shippings
2. Fill create form:
   - Order ID: 102
   - Carrier: "GHN"
   - Tracking Code: "GHN12345"
   - Estimated: 2024-05-15 18:00
3. Click "Tao van chuyen"

**Expected Result**:
- Shipping created, appears in list
- Toast: "Tao van chuyen thanh cong"

**Then Track**:
1. Scroll to tracking section
2. Enter tracking code: "GHN12345"
3. Click "Tim kiem"

**Expected Result**:
- Tracking info displays below form
- Shows Order #102, Status, Carrier

**Then Mark In Transit**:
1. Find shipping in list
2. Click "In Transit" button
3. Status changes to IN_TRANSIT

---

### 5. RBAC - Non-Admin Cannot Access

**Preconditions**:
- User logged in as SELLER or USER

**Steps**:
1. Navigate to /admin/products
2. Page redirects to 404

**Expected Result**:
- User sees "404 Not Found" page
- Can navigate back to home

---

### 6. Search and Pagination

**Test Products**:
1. Ensure 20+ products exist
2. Go to /admin/products
3. Enter search term: "iphone"
4. Only IP products shown, pagination updates
5. Change page using buttons
6. Verify count updates correctly

**Expected Result**:
- Search filters items correctly
- Pagination buttons enable/disable appropriately
- Page info shows accurate count

---

## Error Scenarios

### Product Create - Invalid Owner ID
**Body**: { name: "Test", price: 100, ownerId: 99999 }
**Expected**: 404 User Not Found

### Order Status - Invalid Transition
**Current**: PENDING → **Invalid**: DELIVERED
**Expected**: 400 Invalid Order Status Transition

### Review Approve - Already Approved
**Steps**: Approve review twice
**Expected**: isApproved still true, no error (idempotent)

### Shipping Create - Missing Order
**Body**: { orderId: 99999, carrierName: "ViettelX" }
**Expected**: 404 Order Not Found

---

## Performance Notes

- Pagination: 8 items per page (configurable in page components)
- Search: Client-side filtering (OK for MVP, consider server-side for 1000+ items)
- Images: Uploaded to backend file service, returned as public URLs
- Caching: No caching implemented (fresh data on each navigate)

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token expired or missing | Refresh token auto-handled; if persists, re-login |
| 403 Forbidden | User not ADMIN | Verify user role in localStorage auth; check backend @PreAuthorize |
| Create form doesn't reset | Service call failed silently | Check browser console; ensure all required fields set |
| Pagination stuck | Filtered items < current page size | Auto-resets to max page (see page effect) |
| Search doesn't match | Accented characters | Text normalized via normalizeText() function |
| Shipping sync didn't work | No shipping for order | Create shipping first, then update order status |


