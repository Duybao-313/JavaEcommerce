# Task List & Completion Status — SplitGo

> **Last Updated**: 2026-05-31

---

## Project Completion: ~92%

---

## 1. Completed Modules ✅

### 1.1 Authentication & Authorization — 95%

| Task                        | Status | Notes                                |
| --------------------------- | ------ | ------------------------------------ |
| User registration           | ✅     | username, email, password validation |
| User login (JWT)            | ✅     | Access + refresh token               |
| Token refresh               | ✅     | `/auth/refresh`                      |
| Logout (token invalidation) | ✅     | Stored in `invalidated_token`        |
| Get current user            | ✅     | `/auth/userdetail`                   |
| Update profile              | ✅     | Full name, phone                     |
| Change password             | ✅     | Old/new password validation          |
| Forgot password             | ✅     | Token-based reset flow               |
| Reset password              | ✅     | Verify token + update password       |
| Avatar upload               | ✅     | Cloudinary                           |
| Role-based guards           | ✅     | `@PreAuthorize` on all controllers   |
| Seller profile CRUD         | ✅     | Store name, logo, banner, bank info  |
| Public seller profile       | ✅     | `/auth/sellers/{sellerId}`           |

**Remaining**: Email verification, increase JWT duration for production.

### 1.2 Product Catalog — 95%

| Task                     | Status | Notes                                 |
| ------------------------ | ------ | ------------------------------------- |
| Product listing (public) | ✅     | Pagination 12/page, category filter   |
| Product detail           | ✅     | With variants[] and options[]         |
| Product variants         | ✅     | Independent price/stock/SKU/image     |
| Product options          | ✅     | Derived from variant attributes       |
| Seller CRUD products     | ✅     | With image upload, variants, options  |
| Admin product management | ✅     | Status toggle, adminNote              |
| Store page               | ✅     | Public seller products + best sellers |
| Featured products        | ✅     | `isFeatured` flag                     |
| Slug-based URLs          | ✅     | Product slug, category slug           |
| Admin product moderation | ✅     | PATCH status, adminNote               |

**Remaining**: Full-text search, advanced filters (price range, rating), product import/export.

### 1.3 Categories — 100%

| Task                       | Status | Notes                            |
| -------------------------- | ------ | -------------------------------- |
| Category listing (flat)    | ✅     | `/categories`                    |
| Root categories            | ✅     | `/categories/roots`              |
| Category tree (admin)      | ✅     | Nested hierarchy                 |
| Category CRUD (admin)      | ✅     | With parent assignment           |
| Product count per category | ✅     | `/categories/{id}/product-count` |
| Slug-based navigation      | ✅     |                                  |
| Subcategory support        | ✅     | `parent_id` self-reference       |

### 1.4 Shopping Cart — 95%

| Task                   | Status | Notes                              |
| ---------------------- | ------ | ---------------------------------- |
| Get cart               | ✅     | 1:1 user→cart                      |
| Add item               | ✅     | With optional variantId            |
| Update quantity        | ✅     |                                    |
| Remove item            | ✅     |                                    |
| Variant-aware pricing  | ✅     | variant.salePrice ?? variant.price |
| Stock validation       | ✅     | Against variant or product stock   |
| Quick-add UX (variant) | ✅     | Redirects to detail page           |
| Price snapshot         | ✅     | Saved at add time                  |

**Remaining**: Cart persistence for guest users, merge cart on login.

### 1.5 Checkout & Orders — 90%

| Task                    | Status | Notes                                    |
| ----------------------- | ------ | ---------------------------------------- |
| Checkout                | ✅     | From cart, variant stock decrement       |
| Order code generation   | ✅     | Unique code per order                    |
| My orders list          | ✅     | Buyer view                               |
| Order detail            | ✅     | With items, variant attrs                |
| Cancel order (buyer)    | ✅     | PENDING→CANCELLED                        |
| Confirm delivery        | ✅     | Triggers review flow                     |
| Reviewable items        | ✅     | Per-order review eligibility             |
| Seller order management | ✅     | View, update status, cancel              |
| Admin all orders        | ✅     | Full view                                |
| Financial tracking      | ✅     | discountAmount, shippingFee, finalAmount |
| Shipping timestamps     | ✅     | shippedAt, deliveredAt                   |

**Remaining**: Order status history/log, email notifications on status change, bulk order operations.

### 1.6 Reviews & Ratings — 85%

| Task                      | Status | Notes                              |
| ------------------------- | ------ | ---------------------------------- |
| Create review             | ✅     | Rating 1-5, title, comment, images |
| Product reviews list      | ✅     | All + approved only                |
| Review summary            | ✅     | Average rating, distribution       |
| User reviews list         | ✅     |                                    |
| Admin review management   | ✅     | List, approve, reject              |
| Delete review             | ✅     | Owner or admin                     |
| Variant-level review      | ✅     | `variant_id` FK                    |
| Duplicate prevention      | ✅     | Per product+variant per order      |
| Post-purchase review flow | ✅     | Modal after confirm delivery       |

**Remaining**: Review helpfulness voting, review report/flag, seller response to reviews.

### 1.7 Wishlist — 100%

| Task                 | Status | Notes               |
| -------------------- | ------ | ------------------- |
| Add to wishlist      | ✅     | Unique user+product |
| Remove from wishlist | ✅     |                     |
| List wishlist        | ✅     | User's items        |
| Check if wishlisted  | ✅     | Boolean response    |

### 1.8 Shipping — 85%

| Task            | Status | Notes                   |
| --------------- | ------ | ----------------------- |
| Create shipping | ✅     | Seller/admin only       |
| Update shipping | ✅     | Status, tracking, dates |
| Get by order ID | ✅     |                         |
| Track by code   | ✅     |                         |
| Mark delivered  | ✅     | User or admin           |
| Mark in transit | ✅     | Seller or admin         |
| Shipping list   | ✅     | All shippings           |

**Remaining**: Buyer-facing shipping status view, carrier integration (API), estimated delivery calculation.

### 1.9 Coupons — 80%

| Task               | Status | Notes                                    |
| ------------------ | ------ | ---------------------------------------- |
| Public coupon list | ✅     | Active coupons                           |
| Find by code       | ✅     |                                          |
| Validate coupon    | ✅     | Against cart items                       |
| Admin CRUD         | ✅     | Create, read, update, patch, soft delete |
| Search/filter      | ✅     | By code, active status                   |
| Scoped coupons     | ✅     | ALL, CATEGORY, PRODUCT, SELLER           |
| Usage tracking     | ✅     | usageLimit, usedCount                    |

**Remaining**: Apply coupon at checkout (wired into order), coupon usage history per user, one-time-use enforcement.

### 1.10 Admin Dashboard — 90%

| Task                | Status | Notes                                 |
| ------------------- | ------ | ------------------------------------- |
| User listing        | ✅     | Search, role filter, pagination, sort |
| User detail         | ✅     |                                       |
| Update user         | ✅     |                                       |
| Role assignment     | ✅     | Assign/remove role                    |
| Seller verification | ✅     | PENDING→APPROVED/REJECTED             |
| Store status        | ✅     | ACTIVE/SUSPENDED                      |
| Account activation  | ✅     | Toggle isActive                       |
| Delete user         | ✅     |                                       |
| Admin order detail  | ✅     |                                       |

**Remaining**: Dashboard statistics (revenue, users, orders), activity log, bulk actions.

### 1.11 Image Upload — 100%

| Task              | Status | Notes                 |
| ----------------- | ------ | --------------------- |
| Image upload      | ✅     | Cloudinary, multipart |
| Seller/admin only | ✅     | Role-gated            |

---

## 2. Missing / Incomplete Modules ❌

| Module                       | Priority | Effort    | Description                                                               |
| ---------------------------- | -------- | --------- | ------------------------------------------------------------------------- |
| **Address Book**             | HIGH     | 3-5 days  | Address entity ✅ DTOs, ❌ Entity/Repo/Service/Controller, ❌ Frontend UI |
| **Email Verification**       | MEDIUM   | 2-3 days  | Send verification email, verify endpoint                                  |
| **Password Reset**           | ✅ DONE  | Completed | Forgot password flow with reset token                                     |
| **Payment Gateway (SePay)**  | ✅ DONE  | Completed | SePay VietQR, IPN webhook, callback, status sync, frontend integration    |
| **Coupon at Checkout**       | MEDIUM   | 1-2 days  | Apply coupon discount during checkout                                     |
| **Order Status History**     | LOW      | 2-3 days  | Log all status transitions                                                |
| **Email Notifications**      | LOW      | 3-5 days  | Order confirmation, status updates                                        |
| **Search Engine**            | LOW      | 3-5 days  | Full-text product search (Elasticsearch/MySQL FTS)                        |
| **Analytics Dashboard**      | LOW      | 5-7 days  | Sales reports, user stats, charts                                         |
| **Return/Refund**            | LOW      | 5-7 days  | Return request, approval, refund flow                                     |
| **Chat/Messaging**           | LOW      | 7-10 days | Buyer-seller real-time chat                                               |
| **Unit & Integration Tests** | MEDIUM   | 5-7 days  | Backend test coverage, E2E tests                                          |
| **Performance Optimization** | LOW      | 3-5 days  | Caching, query optimization, lazy loading                                 |

### 2.2 Payment Gateway (SePay) — ✅ COMPLETED

> **Status**: ✅ Done | Production: `SP-LIVE-PD395947`

**Luồng thanh toán:**

1. User chọn SePay khi checkout → Backend tạo Order (PENDING_PAYMENT) + PaymentTransaction (PENDING)
2. Backend tạo form thanh toán với chữ ký HMAC-SHA256 → Trả về formFields
3. Frontend auto-submit form sang `pay.sepay.vn/v1/checkout/init`
4. SePay redirect user sang trang thanh toán (QR VietQR / thẻ)
5. User thanh toán xong:
   - SePay gọi IPN webhook → Backend cập nhật Order (CONFIRMED) + Payment (PAID)
   - SePay redirect browser về success_url (có ?order_invoice_number=...) → Backend callback set status
6. Backend redirect browser về frontend `/orders/{numericId}?payment=success` ✅

| #     | Task                                     | File                                             | Status |
| ----- | ---------------------------------------- | ------------------------------------------------ | ------ |
| PG-01 | Thêm `SEPAY` vào PaymentMethod enum      | `Enum/PaymentMethod.java`                        | ✅     |
| PG-02 | Mở rộng PaymentTransaction entity        | `Model/PaymentTransaction.java`                  | ✅     |
| PG-03 | Tạo SePayConfig (merchantId, secretKey)  | `Config/SePayConfig.java`                        | ✅     |
| PG-04 | Tạo SePayService interface               | `Service/SePayService.java`                      | ✅     |
| PG-05 | Tạo SePayServiceImpl (sign, verify IPN)  | `Service/Impl/SePayServiceImpl.java`             | ✅     |
| PG-06 | Tạo SePayController (IPN + callback)     | `Controller/SePayController.java`                | ✅     |
| PG-07 | Sửa checkout() xử lý SePay flow          | `Service/Impl/OrderServiceImpl.java`             | ✅     |
| PG-08 | Thêm cấu hình SePay vào application.yaml | `resources/application.yaml`                     | ✅     |
| PG-09 | Tạo SePay IPN DTO                        | `DTO/request/payment/SePayIpnRequest.java`       | ✅     |
| PG-10 | Tạo SePay PaymentResponse DTO            | `DTO/response/payment/SePayPaymentResponse.java` | ✅     |
| PG-11 | Thêm lựa chọn SePay trong CheckoutPage   | `pages/CheckoutPage.jsx`                         | ✅     |
| PG-12 | Handle SePay callback redirect           | `SePayController.paymentSuccess()`               | ✅     |
| PG-13 | Backend endpoint GET /orders/by-code     | `OrderController.getOrderByCode()`               | ✅     |
| PG-14 | Frontend handle order code param         | `OrderDetailPage.jsx`                            | ✅     |

**Fixes đã áp dụng:**

- Fix success_url gắn `order_invoice_number` vào query string
- Fix callback redirect dùng numeric ID thay vì order code
- Fix duplicate field `orderStatus` trong Order entity
- Thêm endpoint `/orders/by-code/{orderCode}` cho resilience
- Frontend OrderDetailPage hỗ trợ cả numeric ID và order code

---

### 2.1 Address Book — Implementation Plan 🔨

> **Status**: 🟡 DTOs & Enum ready | ❌ Entity/Repo/Service/Controller needed

| #     | Task                                   | File                                         | Status |
| ----- | -------------------------------------- | -------------------------------------------- | ------ |
| AB-01 | Create `Address` entity                | `Model/Address.java`                         | ✅     |
| AB-02 | Create `AddressRepository`             | `Repository/AddressRepository.java`          | ✅     |
| AB-03 | Create `AddressService` interface      | `Service/AddressService.java`                | ✅     |
| AB-04 | Create `AddressServiceImpl`            | `Service/Impl/AddressServiceImpl.java`       | ✅     |
| AB-05 | Create `AddressController`             | `Controller/AddressController.java`          | ✅     |
| AB-06 | Add ErrorCodes                         | `Exception/ErrorCode.java`                   | ✅     |
| AB-07 | Update CheckoutRequest                 | `DTO/request/ecommerce/CheckoutRequest.java` | ✅     |
| AB-08 | Update checkout to use address book    | `Service/Impl/OrderServiceImpl.java`         | ✅     |
| AB-09 | Create Address page UI                 | `pages/AddressPage.jsx`                      | ✅     |
| AB-10 | Create addressService (FE)             | `services/addressService.js`                 | ✅     |
| AB-11 | Integrate address selector in checkout | `pages/CheckoutPage.jsx`                     | ✅     |

---

## 3. Technical Debt 🐛

### 3.1 Database ↔ Entity Inconsistencies

| #         | Issue                                      | Severity | Location                | Fix                                                                                                                                               |
| --------- | ------------------------------------------ | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TD-01** | **Duplicate `status`/`orderStatus` field** | ✅ FIXED | `Order.java`            | ✅ Removed duplicate `orderStatus` field. Only `status` remains.                                                                                  |
| **TD-02** | **Address entity not implemented**         | ✅ FIXED | `Model/Address.java`    | ✅ Created `Address` entity, `AddressRepository`, `AddressService`, `AddressController`. Checkout now supports selecting address via `addressId`. |
| **TD-03** | **`InvalidatedToken` has no User FK**      | LOW      | `InvalidatedToken.java` | Uses JWT `id` (jti) as PK without user reference. Can't query tokens by user.                                                                     |

### 3.2 API ↔ DTO Inconsistencies

| #         | Issue                                      | Severity | Location                      | Fix                                                                                                                                                                                        |
| --------- | ------------------------------------------ | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TD-04** | **Update reuses Create DTO**               | LOW      | `CategoryController.java:105` | PUT `/categories/{id}` uses `CreateCategoryRequest` for updates. Should have a separate `UpdateCategoryRequest` or ensure partial update support.                                          |
| **TD-05** | **Coupon not wired into checkout**         | MEDIUM   | `OrderServiceImpl.java`       | `CheckoutRequest` mentions `couponCode?` but checkout service does not apply coupon discount. Coupon validation API exists but discount calculation is not integrated into order creation. |
| **TD-06** | **Review `isApproved` defaults to `true`** | LOW      | `Review.java:71`              | Reviews auto-approve on creation. Admin approve/reject endpoints exist but are effectively no-op for new reviews. Consider changing default to `false` if moderation is desired.           |

### 3.3 Frontend Inconsistencies

| #         | Issue                               | Severity | Location       | Fix                                                                                                                                       |
| --------- | ----------------------------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **TD-07** | **`axios` is an unused dependency** | LOW      | `package.json` | Package includes `axios` (`^1.6.2`) but `apiClient.js` uses native `fetch` API. Remove `axios` or migrate `apiClient` to use it.          |
| **TD-08** | **No Address UI**                   | HIGH     | Frontend       | No address management page. Checkout uses inline fields. Needs address book UI matching the `Address` DTOs that already exist in backend. |

### 3.4 Configuration Debt

| #         | Issue                                     | Severity | Location           | Fix                                                                                                                                      |
| --------- | ----------------------------------------- | -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **TD-09** | **JWT duration too short for production** | HIGH     | `application.yaml` | Access token: 6000ms (6 seconds), Refresh: 600000ms (10 min). These are testing values. Production should be ~15min access, ~7d refresh. |
| **TD-10** | **`ddl-auto: update` in production**      | HIGH     | `application.yaml` | Auto DDL update is risky. Use validated migration tool (Flyway/Liquibase) for production.                                                |

---

## 4. Module Completion Summary

| Module                      | Completion | Status                                      |
| --------------------------- | ---------- | ------------------------------------------- |
| Auth & Security             | 95%        | ✅ Complete                                 |
| Product Catalog             | 95%        | ✅ Complete                                 |
| Categories                  | 100%       | ✅ Complete                                 |
| Shopping Cart               | 95%        | ✅ Complete                                 |
| Checkout & Orders           | 90%        | ✅ Complete                                 |
| Reviews & Ratings           | 85%        | ✅ Complete                                 |
| Wishlist                    | 100%       | ✅ Complete                                 |
| Shipping                    | 85%        | ✅ Complete                                 |
| Coupons                     | 80%        | ✅ Complete                                 |
| Admin Dashboard             | 90%        | ✅ Complete                                 |
| Image Upload                | 100%       | ✅ Complete                                 |
| Seller Profile              | 85%        | ✅ Complete                                 |
| **Address Book**            | **95%**    | ✅ Complete (Backend + Frontend)            |
| **Payment Gateway (SePay)** | **95%**    | ✅ Complete (Backend + Frontend + Callback) |
| **Email System**            | **0%**     | ❌ Missing                                  |
| **Search**                  | **20%**    | ❌ Basic only                               |
| **Testing**                 | **15%**    | ❌ Minimal                                  |

### Overall Completion: **~91%**

---

## 5. Priority Action Items

### Immediate (Week 1-2)

1. ~~[TD-02] Implement Address entity + CRUD API~~ ✅ Done
2. **[TD-01]** Remove duplicate `orderStatus` field from Order
3. **[TD-09]** Increase JWT token duration for production
4. **[TD-05]** Wire coupon discount into checkout flow

### Short-term (Week 3-4)

5. ~~[TD-08] Build Address Book UI in frontend~~ ✅ Done
6. **[TD-03]** Add user FK to InvalidatedToken
7. Email verification flow
8. ~~Password reset flow~~ ✅ Done

### Medium-term (Month 2-3)

9. Payment gateway integration (SePay)
10. Unit & integration tests
11. **[TD-10]** Database migration strategy (Flyway)
12. Order status history logging

### Long-term (Month 4+)

13. Full-text product search
14. Analytics dashboard
15. Return/refund workflow
16. Buyer-seller chat
