# Project Specification — SplitGo E-Commerce

> **Version**: 1.0 | **Last Updated**: 2026-05-31 | **Status**: Active Development

---

## 1. Overview

**SplitGo** is a multi-seller e-commerce platform built with Spring Boot (Java 17) backend and React 18 + Vite frontend. It supports three user roles: Buyer, Seller, and Admin.

| Property          | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Project Name**  | SplitGo                                          |
| **Backend**       | Spring Boot 4.0.5, Java 17, MySQL, JPA/Hibernate |
| **Frontend**      | React 18.2, Vite 5, Tailwind CSS 4               |
| **Auth**          | JWT (access + refresh token), Spring Security    |
| **Image Storage** | Cloudinary                                       |
| **API Docs**      | SpringDoc OpenAPI 2.3.0 (Swagger)                |
| **Backend Port**  | 8080                                             |
| **Frontend Port** | 3000                                             |

---

## 2. User Roles

| Role             | Description             | Permissions                                                                                      |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Guest**        | Unauthenticated visitor | View products, categories, seller stores; Register; Login                                        |
| **USER** (Buyer) | Authenticated customer  | Cart, Checkout, Orders, Reviews, Wishlist, Profile                                               |
| **SELLER**       | Store owner             | CRUD own products, view own orders, manage shipping, store profile                               |
| **ADMIN**        | System administrator    | User management, seller verification, product moderation, category management, coupon management |

---

## 3. Functional Modules

### 3.1 Authentication & Authorization

- Register (username, email, password)
- Login (JWT access token 6000ms + refresh token 600000ms)
- Refresh token, Logout (token invalidation)
- Change password, Update avatar
- Role-based route guards (Spring Security `@PreAuthorize`)

### 3.2 Product Catalog

- Product listing with pagination (12/page), category filter
- Product detail with variants (size, color, etc.)
- Product variants with independent price, stock, SKU, image
- Product options derived from variant attributes
- Admin product moderation (status: ACTIVE/INACTIVE, adminNote)
- Seller product CRUD with image upload
- Store page: public seller products, best sellers
- Featured products flag

### 3.3 Category Management

- Hierarchical categories (parent-child via `parent_id`)
- Slug-based navigation (`/categories/:slug`)
- Sort order, active/inactive toggle
- Category tree for admin
- Product count per category

### 3.4 Shopping Cart

- One cart per user (1:1 User→Cart)
- Variant-aware cart items (each variant = separate cart item)
- Price snapshot at add time
- Quantity validation against variant/product stock
- Quick-add UX: variant products redirect to detail page

### 3.5 Checkout & Orders

- Checkout with recipient name, phone, shipping address, note, payment method
- Order code generation (unique)
- Multi-seller order support (`seller_id` on Order)
- Order status lifecycle: PENDING → PROCESSING → SHIPPED → DELIVERED / CANCELLED
- Financial tracking: discountAmount, shippingFee, finalAmount
- Buyer order history, order detail
- Seller order management (view, update status, cancel)
- Admin full order view
- Confirm delivery → triggers review flow

### 3.6 Reviews & Ratings

- 5-star rating with title, comment, images (up to 5)
- Variant-level reviews (`variant_id` on Review)
- Post-purchase review flow (confirm delivery → review modal)
- Duplicate prevention per product+variant per order
- Admin review management (approve/reject)
- Product review summary (average rating, distribution)

### 3.7 Wishlist

- Add/remove product to wishlist
- Unique constraint per user+product
- Check if product is wishlisted

### 3.8 Shipping

- Create shipping record per order
- Tracking code, carrier name
- Status: PENDING → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / FAILED
- Estimated delivery date
- Tracking lookup by code

### 3.9 Coupons

- Coupon types: PERCENTAGE, FIXED_AMOUNT
- Scopes: ALL, CATEGORY, PRODUCT, SELLER
- Min order value, max discount amount
- Validity period (startAt, endAt)
- Public coupon listing
- Coupon validation against cart
- Admin CRUD with pagination, search, active toggle

### 3.10 Admin Dashboard

- User listing with search, role filter, pagination
- User detail, update, role assignment
- Seller verification (PENDING → APPROVED/REJECTED)
- Store status management (ACTIVE/SUSPENDED)
- Account activation toggle
- User deletion

### 3.11 Seller Profile

- Store name, logo, banner
- Store address, bank account, tax code, business license
- Verification status tracking
- Store rating, total sales
- Public store page (`/auth/sellers/{sellerId}`)

### 3.12 Address Book

- CRUD addresses per user (recipient name, phone, detail, type)
- Address types: HOME, OFFICE, OTHER
- Default address flag (auto-unset previous default)
- Max 10 addresses per user
- Integrate with checkout: select saved address or enter new one
- Delete address with default fallback protection

---

## 4. Out of Scope (Future Phases)

- Real payment gateway integration (VNPay, Momo, Stripe)
- Complex promotion campaigns / voucher rules
- Real-time inventory via event streaming
- Chat/messaging between buyer-seller
- Order return/refund workflow
- Multi-language (i18n)
- Analytics dashboard
- Mobile app (React Native/Flutter)

---

## 5. Non-Functional Requirements

| Requirement        | Target                                                       |
| ------------------ | ------------------------------------------------------------ |
| **Performance**    | API response < 200ms p95                                     |
| **Scalability**    | Support 1M+ users, 10K+ orders/day                           |
| **Security**       | JWT auth, role-based access, CORS configured                 |
| **Availability**   | 99.5% uptime                                                 |
| **Data Integrity** | Optimistic locking on ProductVariant, transactional checkout |

---

## 6. Tech Stack Details

### Backend Dependencies

- `spring-boot-starter-web` — REST API
- `spring-boot-starter-data-jpa` — ORM
- `spring-boot-starter-security` + `oauth2-resource-server` — Auth
- `mysql-connector-j` — Database
- `h2` — Test database
- `lombok` 1.18.34 — Boilerplate reduction
- `mapstruct` 1.5.5 — Object mapping
- `cloudinary-http44` 1.29.0 — Image upload
- `springdoc-openapi` 2.3.0 — API documentation
- `spring-boot-starter-validation` — Input validation
- `spotless-maven-plugin` 2.43.0 — Code formatting

### Frontend Dependencies

- `react` 18.2, `react-dom` 18.2
- `react-router-dom` 6.20 — Routing
- `axios` 1.6.2 — HTTP client
- `tailwindcss` 4.2.4 — Styling
- `motion` 12.38 — Animations
- `react-hot-toast` 2.5.2 — Notifications
- `facehash` 0.1.0 — Avatar generation
