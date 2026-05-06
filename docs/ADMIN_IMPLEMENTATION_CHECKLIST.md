# Admin Dashboard - Implementation Checklist

## Backend Verification

### Database Models
- [x] Product: has seller (owner) field, status (ACTIVE/INACTIVE)
- [x] Order: has buyer, status (PENDING/CONFIRMED/PREPARING/SHIPPING/DELIVERED/CANCELLED)
- [x] OrderItem: links order to seller
- [x] Review: has isApproved flag
- [x] Shipping: has status (PENDING/IN_TRANSIT/DELIVERED/FAILED)

### Repository Layer
- [x] ProductRepository: `findAllByOrderByCreatedAtDesc()` added
- [x] OrderRepository: `findAllByOrderByCreatedAtDesc()` added
- [x] ReviewRepository: `findAllByOrderByCreatedAtDesc()` added
- [x] ShippingRepository: `findAllByOrderByCreatedAtDesc()` added

### Service Layer
- [x] CatalogService: `getAllProducts()` added, signature updates for admin
- [x] OrderService: `getAllOrders()` added, `updateOrderStatus(actorId, isAdmin, orderId, status)`
- [x] ReviewService: `getAllReviews()` added
- [x] ShippingService: `getAllShippings()` added

### Controller Layer
- [x] ProductController: `GET /products/admin`, `POST/PUT/DELETE` now allow ADMIN
- [x] OrderController: `GET /orders`, `PATCH /orders/{id}/status` allow ADMIN
- [x] ReviewController: `GET /reviews/admin`
- [x] ShippingController: `GET /shippings`, protected endpoints require role

### DTO Updates
- [x] CreateProductRequest: added `ownerId` field (optional)
- [x] UpdateShippingRequest: added `estimatedDelivery`, `actualDelivery`

### Security
- [x] @PreAuthorize annotations on all admin endpoints
- [x] Ownership/role checks before mutations
- [x] Enum import in ProductController for role check

## Frontend Verification

### Routing
- [x] App.jsx: Import all admin page components
- [x] App.jsx: Add admin route with layout and nested routes
- [x] RoleRoute: existing component validates ADMIN role
- [x] Non-admin redirect to 404 on /admin access

### Services
- [x] adminService.js: All API methods for products/orders/reviews/shippings
- [x] All methods use `authFetch()` with JWT token
- [x] Error handling and response parsing

### Components
- [x] ConfirmationModal: Reusable dialog with customizable text/actions
- [x] PaginationBar: Previous/next buttons with page info

### Utilities
- [x] adminHelpers.js: `normalizeText()`, `paginate()`, `formatPrice()`, `formatDateTime()`

### Pages
- [x] AdminLayout.jsx: Sidebar nav, responsive grid, Outlet for nested routes
- [x] AdminProductsPage.jsx: Table, search, create/edit/delete, pagination
- [x] AdminOrdersPage.jsx: Table, status dropdown, shipping sync, pagination
- [x] AdminReviewsPage.jsx: Table, approve/reject/delete, confirmation, pagination
- [x] AdminShippingsPage.jsx: Create form, track lookup, mark in-transit/delivered, pagination
- [x] AdminUsersPage.jsx: Placeholder component

### UI/UX
- [x] Loading states shown during data fetch
- [x] Empty state when no data
- [x] Search filters with accent normalization
- [x] Pagination with max page safeguard
- [x] Confirmation modal for destructive actions
- [x] Toast notifications (success/error)
- [x] Responsive tables with overflow-x on mobile
- [x] Disabled buttons during saving

## Testing Scenarios

### Products Module
- [ ] Admin can view all products (including inactive)
- [ ] Admin can create product with ownerId
- [ ] Admin can edit any product
- [ ] Admin can delete (mark inactive) any product
- [ ] Search filters work with vendor name
- [ ] Pagination controls work
- [ ] Confirmation shown before delete

### Orders Module
- [ ] Admin can view all orders
- [ ] Admin can change order status via dropdown
- [ ] When order marked DELIVERED, shipping status syncs
- [ ] Status change is persisted and reflected in UI
- [ ] Pagination works
- [ ] Search filters by order ID / buyer

### Reviews Module
- [ ] Admin can view all reviews (pending/approved/rejected)
- [ ] Admin can approve pending review → isApproved = true
- [ ] Admin can reject approved review → isApproved = false
- [ ] Admin can delete review → record removed
- [ ] Confirmation shown before delete
- [ ] Pagination and search work

### Shippings Module
- [ ] Admin can view all shippings
- [ ] Admin can create shipping with OrderId + carrier + estimatedDelivery
- [ ] Admin can mark shipping IN_TRANSIT
- [ ] Admin can mark shipping DELIVERED (sets actualDelivery)
- [ ] Admin can track by tracking code
- [ ] Pagination and search work

### RBAC
- [ ] Non-admin user redirected from /admin routes
- [ ] Non-admin cannot call /products/admin API (401/403)
- [ ] Non-admin cannot modify products/orders/reviews/shippings
- [ ] Seller can still create/edit own products
- [ ] Seller can still update own orders

## Deployment Checklist

### Pre-Deploy
- [ ] All Java files compile without errors
- [ ] All React components have no TypeScript/ESLint errors
- [ ] Backend environment variables configured
- [ ] Frontend VITE_API_BASE points to correct backend URL
- [ ] Database migrations applied (if any)
- [ ] Demo admin account exists in database

### Testing Environment
- [ ] Start backend on http://localhost:8080
- [ ] Start frontend on http://localhost:3000
- [ ] Login with admin account
- [ ] Navigate through all 5 dashboard modules
- [ ] Test create/read/update/delete on each module

### Production Deployment
- [ ] Backend: Build with `mvn clean package`
- [ ] Frontend: Build with `npm run build`
- [ ] Deploy Docker containers or JAR + static files
- [ ] Update reverse proxy routing if needed
- [ ] Health check endpoints available
- [ ] Error logging configured
- [ ] CORS origins updated for production domain

## Documentation

- [x] ADMIN_DASHBOARD_README.md created with overview
- [x] API contracts documented in code comments
- [x] Service layer signatures clear with admin flag
- [x] Component props documented

## Known Limitations / Future Work

- [ ] User management module not implemented (placeholder exists)
- [ ] No server-side pagination (using client-side; fine for MVP)
- [ ] No audit logging for admin actions
- [ ] No bulk operations on tables
- [ ] No CSV export functionality
- [ ] No real-time updates (WebSocket)
- [ ] Admin can't suspend user accounts yet
- [ ] No dashboard widgets/stats

---

**Status**: ✅ Implementation Complete

All core admin dashboard features have been built, integrated with backend RBAC, and styled for responsive UX. Ready for QA testing and deployment.

