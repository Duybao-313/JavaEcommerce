# Admin Dashboard Implementation Summary

## Overview
Created a comprehensive Admin Dashboard for the SplitGo ecommerce platform with full RBAC (role-based access control), pagination, search, and responsive UX. The dashboard enables admins to manage products, orders, reviews, and shipments.

## Backend Changes

### 1. Enhanced Product Management (`ProductController` & `CatalogService`)
- **New Endpoint**: `GET /products/admin` - Admin-only listing of all products (including inactive)
- **Enhanced Endpoints**: POST/PUT/DELETE `/products` now support both SELLER and ADMIN roles
- **Admin Feature**: Admin can create products on behalf of sellers by specifying `ownerId` in request
- **Service Logic**: Added `getAllProducts()` to list all products regardless of status
- **Repository**: Added `findAllByOrderByCreatedAtDesc()` for admin listing

### 2. Order Status Management (`OrderController` & `OrderService`)
- **New Endpoint**: `GET /orders` - Admin-only listing of all orders
- **New Endpoint**: `PATCH /orders/{orderId}/status` - Unified admin/seller status updates
- **Auto-sync**: When order status becomes DELIVERED, syncs to associated shipping record
- **Old Route Preserved**: `PATCH /seller/orders/{orderId}/status` remains for backward compat

### 3. Review Moderation (`ReviewController` & `ReviewService`)
- **New Endpoint**: `GET /reviews/admin` - Admin-only listing of all reviews
- **Existing Endpoints**: Approve/reject/delete remain unchanged
- **Repository**: Added `findAllByOrderByCreatedAtDesc()` for sorting

### 4. Shipping Management (`ShippingController` & `ShippingService`)
- **New Endpoints**: 
  - `GET /shippings` - List all shippings (admin/seller accessible)
  - `POST /shippings` - Create shipping (already admin-enabled)
- **Protected Endpoints**: `/shippings/order/{orderId}` and `/shippings/track` now require SELLER or ADMIN role
- **DTO Update**: `UpdateShippingRequest` now includes `estimatedDelivery` and `actualDelivery` fields

### 5. Security Enhancements
- All admin endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Product/order/review mutations require ownership check OR admin role
- Status transitions validated server-side
- Request validation via DTO constraints

## Frontend Changes

### 1. New Admin Routes (in `App.jsx`)
```
/admin                    → AdminLayout (main container)
  /admin/products         → Product management
  /admin/orders           → Order management
  /admin/reviews          → Review moderation
  /admin/shippings        → Shipping tracking
  /admin/users            → User management (placeholder)
```

### 2. Admin Services (`adminService.js`)
Centralized API client for all admin operations:
- `getAdminProducts()` - Fetch all products
- `createAdminProduct()`, `updateAdminProduct()`, `deleteAdminProduct()`
- `getAdminOrders()`, `updateOrderStatus()`
- `getAdminReviews()`, `approveReview()`, `rejectReview()`, `deleteReview()`
- `getShippings()`, `createShipping()`, `updateShipping()`
- `markShippingInTransit()`, `markShippingDelivered()`
- `trackShipping()`, `getShippingByOrderId()`

### 3. Reusable Admin Components
- **ConfirmationModal** (`components/admin/ConfirmationModal.jsx`)
  - Customizable danger/normal dialogs for destructive actions
  - Works with async operations and loading states
  
- **PaginationBar** (`components/admin/PaginationBar.jsx`)
  - Simple pagination controls (previous/next, page info)
  
- **adminHelpers.js** - Utility functions:
  - `normalizeText()` - Accent-insensitive search
  - `paginate()` - Slice items for current page
  - `formatPrice()` - VND currency formatting
  - `formatDateTime()` - Vietnamese locale datetime

### 4. Admin Pages (all in `pages/admin/`)

#### **AdminLayout.jsx**
- Left sidebar navigation with active state
- Responsive grid layout (sidebar on desktop, stacked on mobile)
- Admin brand label and menu items

#### **AdminProductsPage.jsx**
Features:
- Table listing: Image, Name, SKU, Price, Stock, Owner, Actions
- Search by name/SKU/seller username
- Pagination with page info
- Inline form for create/edit
- Owner ID field (admin can create on behalf of sellers)
- Confirmation modal for delete
- Optimistic UI updates
- Disabled state handling

#### **AdminOrdersPage.jsx**
Features:
- Table listing: OrderId, Buyer, Total, Status, CreatedAt
- Status select dropdown for inline updates
- Auto-sync shipping when order marked DELIVERED
- Search by orderId/buyer username/status
- Pagination
- Loading and empty states

#### **AdminReviewsPage.jsx**
Features:
- Table listing: Reviewer, Product, Rating, Content, Status, Actions
- Three-button actions: Approve, Reject, Delete
- Status indicator (approved/pending-rejected)
- Review content preview with line clamp
- Confirmation dialog for delete
- Pagination and search

#### **AdminShippingsPage.jsx**
Features:
- Create form: OrderId, Carrier, TrackingCode, EstimatedDelivery
- Tracking lookup: Search by tracking code with result display
- Table listing: ShippingId, OrderId, Carrier, TrackingCode, Status
- Action buttons: Mark In Transit, Mark Delivered
- Status-aware button disabling (e.g., "Mark In Transit" disabled if already in-transit)
- Pagination and search

#### **AdminUsersPage.jsx**
- Placeholder for future user management module

### 5. Routing & Access Control
- RBAC guard: `RoleRoute` component checks user.role === 'ADMIN'
- Non-admin users redirected to 404 on admin route access
- Session extracted from localStorage via `getAuthSession()`

## Testing Checklist

### Backend Tests
- [ ] Admin can list all products via GET /products/admin
- [ ] Admin can create product with ownerId field
- [ ] Admin can update/delete any product (not just own)
- [ ] Non-admin cannot access /products/admin (401/403)
- [ ] Order status update syncs shipping when marked DELIVERED
- [ ] Review approve/reject updates isApproved flag
- [ ] Shipping endpoints require SELLER or ADMIN role

### Frontend Tests
- [ ] Non-admin user redirected from /admin routes
- [ ] Admin can view all 5 dashboard modules
- [ ] Products page: create, edit, delete with confirmation
- [ ] Orders page: change status and see it update in real-time
- [ ] Reviews page: approve/reject/delete functional
- [ ] Shippings page: create, track, mark in-transit/delivered
- [ ] Pagination works correctly across all modules
- [ ] Search filters work (accented text normalization)
- [ ] Toasts appear for success/error
- [ ] Loading states show during API calls
- [ ] Responsive layout on mobile/tablet/desktop

### E2E Test Examples (Playwright)
```javascript
// Products: Admin creates product with ownerId
test('admin can create product for seller', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/products');
  // Fill form with ownerId
  // Verify product appears in list
});

// Orders: Admin changes order status
test('admin updates order status and syncs shipping', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/orders');
  // Select new status
  // Verify toast success
  // Verify status changed in table
});

// Reviews: Admin approves review
test('admin approves pending review', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/reviews');
  // Find pending review
  // Click Approve button
  // Verify status shows "approved"
});
```

## Key Design Decisions

1. **REST over GraphQL**: Leveraged existing Spring Boot API endpoints; added new routes for admin listing
2. **Pagination Client-Side**: Simple offset-based pagination for MVP; backend could support server-paginated queries later
3. **Confirmation Dialogs**: Used for delete operations to prevent accidental data loss
4. **Optimistic Updates**: UI updates immediately on success; rollback on error
5. **Normalized Text Search**: Vietnamese support with accent normalization for better UX
6. **Shared Admin Service**: Centralized API client reduces duplicate code
7. **Responsive Table**: Overflow-x on mobile, full width on desktop with sticky headers
8. **Role Check on Client & Server**: Client-side redirect for UX; server-side enforcement for security

## Future Enhancements

1. **User Management Module**: Add admin endpoints to list/promote/suspend users
2. **Audit Logging**: Track who performed what action and when
3. **Bulk Operations**: Select multiple rows and perform batch actions
4. **Export to CSV**: Download lists for reporting
5. **Advanced Filtering**: Date ranges, multi-select filters
6. **Server-Side Pagination**: For large datasets, implement cursor-based or offset-limit pagination
7. **Real-Time Updates**: WebSocket integration for live data sync
8. **Admin Dashboard Widget**: Stats like total orders, revenue, pending reviews

## Security Notes

- Token-based JWT auth via Authorization header
- All sensitive operations (create/update/delete) require valid token
- CORS configured in SecurityConfigV2 to allow localhost:3000
- Server validates ownership (product seller, order items seller, review owner)
- No sensitive data exposed in client logging
- Input validation on both client and server sides

## Deployment Notes

1. Ensure backend runs on port 8080 (or update VITE_API_BASE)
2. Frontend should run on port 3000 (CORS configured for this)
3. Use demo admin account to test:
   - Username: admin
   - Password: admin
4. Database should have demo data seeded for testing
5. File upload service must be configured for product image uploads

## File Inventory

### Backend (Java)
```
Backend/src/main/java/com/duybao/SplitGo/
├── Controller/
│   ├── ProductController.java [MODIFIED]
│   ├── OrderController.java [MODIFIED]
│   ├── ReviewController.java [MODIFIED]
│   └── ShippingController.java [MODIFIED]
├── Service/
│   ├── CatalogService.java [MODIFIED]
│   ├── OrderService.java [MODIFIED]
│   ├── ReviewService.java [MODIFIED]
│   └── ShippingService.java [MODIFIED]
├── Service/Impl/
│   ├── CatalogServiceImpl.java [MODIFIED]
│   ├── OrderServiceImpl.java [MODIFIED]
│   ├── ReviewServiceImpl.java [MODIFIED]
│   └── ShippingServiceImpl.java [MODIFIED]
├── Repository/
│   ├── ProductRepository.java [MODIFIED]
│   ├── OrderRepository.java [MODIFIED]
│   ├── ReviewRepository.java [MODIFIED]
│   └── ShippingRepository.java [MODIFIED]
└── DTO/request/ecommerce/
    ├── CreateProductRequest.java [MODIFIED - added ownerId]
    └── UpdateShippingRequest.java [MODIFIED - added delivery dates]
```

### Frontend (React)
```
Frontend/src/
├── App.jsx [MODIFIED - added admin routes]
├── services/
│   ├── adminService.js [NEW]
│   └── productService.js [UNCHANGED - backward compatible]
├── components/admin/ [NEW]
│   ├── ConfirmationModal.jsx
│   └── PaginationBar.jsx
└── pages/
    ├── admin/ [NEW]
    │   ├── AdminLayout.jsx
    │   ├── adminHelpers.js
    │   ├── AdminProductsPage.jsx
    │   ├── AdminOrdersPage.jsx
    │   ├── AdminReviewsPage.jsx
    │   ├── AdminShippingsPage.jsx
    │   └── AdminUsersPage.jsx
    └── [existing pages unchanged]
```

---

## Quick Start

1. **Backend**: Run Spring Boot app (will auto-create admin endpoints)
2. **Frontend**: Install deps and start dev server
3. **Login**: Use admin account from demo-accounts
4. **Navigate**: Click Admin link or go to /admin
5. **Test**: CRUD operations on each module

For detailed API contract and status codes, see `docs/spec.md`.

