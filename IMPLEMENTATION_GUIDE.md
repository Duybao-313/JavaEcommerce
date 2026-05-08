# Admin Dashboard - Implementation Guide (for PR Review)

## Overview

This PR completes the Admin Dashboard UI refactor with focus on:
1. **Responsive design** (mobile-first approach)
2. **Better UX** (modals, loading states, confirmations)
3. **Code quality** (ESLint setup, proper cleanup, accessibility)

## File-by-File Walkthrough

### AdminLayout.jsx (Refactored)
**Key Changes:**
- **Responsive Grid**: Flex layout instead of fixed grid for better mobile support
- **Collapsible Sidebar**: 
  - Desktop: Always visible (lg: relative)
  - Mobile: Fixed overlay, togglable with hamburger menu
- **Header Component**: Shows logged-in user and logout button
- **Outlet**: Nested route rendering without extra divs

**Mobile UX:**
```
Mobile: [☰] | [Admin name]
          └─ Sidebar overlay (z-40)
             
Desktop: [Sidebar] | [Header above content]
         [nav]    | [Content area]
```

### AdminProductsPage.jsx (Refactored)
**Key Changes:**
- **Modal Form**: Click "Tạo sản phẩm" → form modal (z-50)
- **Loading Spinner**: Shows while fetching products
- **Table Columns**: Name, Price, Stock, Owner, Actions
- **Delete Confirmation**: Modal asks for confirmation
- **Search**: Real-time filter with accent normalization

**Component State:**
```javascript
- products: [array of products]
- form: {name, price, stock, categoryId, ownerId}
- editingId: null (when editing) or productId
- showForm: boolean (modal visibility)
- deleteTarget: product object for confirmation
```

### AdminOrdersPage.jsx (Refactored)
**Key Changes:**
- **Status Badges**: Color-coded (yellow=PENDING, green=DELIVERED, etc.)
- **Inline Status Change**: Select dropdown in table
- **Auto-sync Shipping**: When order→DELIVERED, calls markShippingDelivered()
- **Loading States**: Spinner while fetching, disabled select while saving
- **Search**: Filters by ID, buyer name, status

**Status Colors:**
- PENDING: Yellow (bg-yellow-100)
- CONFIRMED: Blue (bg-blue-100)
- PREPARING: Purple (bg-purple-100)
- SHIPPING: Cyan (bg-cyan-100)
- DELIVERED: Green (bg-green-100)
- CANCELLED: Red (bg-red-100)

### AdminReviewsPage.jsx (Refactored)
**Key Changes:**
- **Card Layout**: Not table (better mobile UX)
- **Rating Display**: Star indicators (★ ★ ★ ★ ★)
- **Status Badges**: 
  - ✓ Đã duyệt (green)
  - ⏳ Chờ duyệt (yellow)
- **Action Buttons**: Approve, Reject, Delete in card footer
- **Delete Confirmation**: Modal before delete

**Card Structure:**
```
┌─ Review Card
│  ├─ Name + Stars + Product
│  ├─ Comment excerpt
│  ├─ Timestamp
│  ├─ Status badge
│  └─ Action buttons
└─────────────
```

### AdminShippingsPage.jsx (Refactored)
**Key Changes:**
- **Modal Create Form**: OrderId, Carrier, TrackingCode, EstimatedDelivery
- **Tracking Lookup**: Search box with amber styling
- **Status Badges**: Color-coded (PENDING→yellow, IN_TRANSIT→blue, DELIVERED→green)
- **Mark Actions**: Buttons disabled intelligently:
  - "Mark In Transit" disabled if already IN_TRANSIT or DELIVERED
  - "Mark Delivered" disabled if already DELIVERED
- **Table Columns**: ID, OrderId, Carrier, TrackingCode, Status, Actions

**Form Sections:**
1. Header + Create button
2. Create form modal
3. Tracking lookup (amber box)
4. Results display (if found)
5. Search + table

### Components Added

#### LoadingSpinner.jsx
```jsx
<div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
```
- Used in all pages while loading data
- Consistent animation timing

#### eslint.config.js
- ESLint v9+ flat config
- Includes globals (window, document, etc.)
- React plugin enabled
- Unused var patterns for `_variableName` convention

## API Contract (adminService.js)

All admin pages use these API calls (already implemented in backend):

```javascript
// Products
getAdminProducts()           // GET /products/admin
createAdminProduct(formData) // POST /products (multipart)
updateAdminProduct(id, body) // PUT /products/{id}
deleteAdminProduct(id)       // DELETE /products/{id}

// Orders
getAdminOrders()            // GET /orders
updateOrderStatus(id, status) // PATCH /orders/{id}/status

// Reviews
getAdminReviews()           // GET /reviews/admin
approveReview(id)           // POST /reviews/{id}/approve
rejectReview(id)            // POST /reviews/{id}/reject
deleteReview(id)            // DELETE /reviews/{id}

// Shippings
getShippings()              // GET /shippings
createShipping(body)        // POST /shippings
markShippingInTransit(id)   // POST /shippings/{id}/mark-in-transit
markShippingDelivered(id)   // POST /shippings/{id}/mark-delivered
trackShipping(code)         // GET /shippings/track?trackingCode=X
getShippingByOrderId(id)    // GET /shippings/order/{id}
```

## Responsive Behavior

### Mobile (< 768px)
- Sidebar: Hidden, togglable overlay
- Header: Full width with hamburger
- Tables: Overflow-x scroll
- Modals: Full width with padding
- Forms: Single column

### Tablet (768px - 1024px)
- Sidebar: Still togglable
- Tables: Scrollable with better padding
- Forms: 2 columns where needed

### Desktop (> 1024px)
- Sidebar: Always visible (lg:relative)
- Tables: Full responsive
- Forms: Multi-column layouts
- Max-width 6xl container

## Performance Considerations

1. **useEffect Cleanup**: isMounted flag prevents memory leaks
2. **Memoization**: Filtered lists memoized for pagination
3. **Pagination**: Only render 10 items per page (configurable)
4. **Search**: Client-side filtering (fine for MVP)
5. **Image Loading**: Product images from backend CDN

## Accessibility (a11y)

- ✅ Semantic HTML (table, form, button)
- ✅ Keyboard navigable forms
- ✅ Skip-to-content via sidebar nav
- ✅ Color contrast: Tailwind defaults (≥ 4.5:1 ratio)
- ✅ ARIA labels on buttons
- ✅ Focus visible states
- ✅ Touch-friendly buttons (min 44px on mobile)

## Error Handling

All pages implement:
```javascript
try {
  const data = await apiCall()
  if (isMounted) setState(data)
} catch (err) {
  if (isMounted) toast.error(err?.message)
} finally {
  if (isMounted) setLoading(false)
}
```

This prevents:
- Memory leaks from unmounted component state updates
- Race conditions from multiple async calls
- Showing errors for cancelled requests

## Testing the PR

### Manual Smoke Test
```bash
cd Frontend
npm install --legacy-peer-deps
npm run dev
# Navigate to http://localhost:3000/admin
# Login with admin account
```

### Test Products
1. Click "Tạo sản phẩm"
2. Fill form and submit
3. Product appears in list
4. Click Edit, modify, save
5. Click Delete, confirm
6. Product removed

### Test Orders
1. Find any order
2. Click status dropdown
3. Select new status (e.g., DELIVERED)
4. Status updates immediately
5. Toast shows success

### Test Reviews
1. Scroll through review cards
2. Click "Duyệt" (Approve)
3. Status changes to "✓ Đã duyệt" (green)
4. Click "Xóa" (Delete)
5. Confirmation modal appears
6. Click "Xóa" to confirm
7. Review removed

### Test Shippings
1. Click "Tạo vận chuyển"
2. Fill modal form, submit
3. Shipping appears in list
4. Click "In Transit"
5. Status changes to "IN_TRANSIT"
6. Click "Delivered"
7. Status changes to "DELIVERED"
8. Try track lookup

### Lint Check
```bash
npm run lint
# Should show 0 errors in admin pages
```

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Sidebar doesn't close after nav | Mobile overlay open | Click overlay or nav link (set setSidebarOpen(false)) |
| Form doesn't submit | Missing required field | Check console, fill all inputs |
| Toast doesn't show | Missing or wrong import | Verify `import toast from "react-hot-toast"` |
| Spinner stuck on load | API error silently caught | Check network tab in DevTools |
| Pagination broken | Page exceeds max | useEffect auto-resets to maxPage |

## Review Checklist for Reviewers

- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors or warnings related to admin code
- [ ] All loading states display correctly
- [ ] Error toasts appear for failed API calls
- [ ] Confirmation modals prevent accidental deletes
- [ ] Modal forms have proper validation
- [ ] Search filters work with accent normalization
- [ ] Pagination controls work correctly
- [ ] Status badges display correct colors
- [ ] Sidebar toggles on mobile
- [ ] Logout button works
- [ ] No memory leaks (check DevTools → Detached DOM nodes)
- [ ] ESLint passes: `npm run lint` returns 0 errors
- [ ] Code follows React best practices
- [ ] No dead/unused code

---

**Ready to merge** ✅
Meets all acceptance criteria for Admin Dashboard UI completion.

