# Architecture — SplitGo

> **Last Updated**: 2026-05-31

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│              React 18 + Vite 5 :3000                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Pages   │ │Components│ │ Context  │ │ Services │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │             │            │            │          │
│       └─────────────┴────────────┴────────────┘          │
│                        │ HTTP/REST                       │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│              SPRING BOOT BACKEND :8080                    │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Filter  │───▶│  Controller  │───▶│   Service    │   │
│  │  Chain   │    │   (REST)     │    │   (Business) │   │
│  │  (JWT)   │    └──────────────┘    └──────┬───────┘   │
│  └──────────┘                               │           │
│                                      ┌──────▼───────┐   │
│                                      │  Repository  │   │
│                                      │   (JPA)      │   │
│                                      └──────┬───────┘   │
│                                             │           │
└─────────────────────────────────────────────┼───────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │     MySQL 8        │
                                    │   ecommerce DB     │
                                    └───────────────────┘
```

---

## 2. Backend Architecture

### Package Structure

```
com.duybao.SplitGo/
├── Config/           # Security, JWT, Cloudinary, App init
│   ├── SecurityConfigV2.java
│   ├── JwtDecoderConfig.java
│   ├── jwtConverter.java
│   ├── JwtAuthenticatedEntryPoint.java
│   ├── ApplicationInitConfig.java
│   └── CloudinaryConfig.java
├── Controller/       # REST API endpoints (13 controllers)
│   ├── AuthenticationController.java
│   ├── ProductController.java
│   ├── CategoryController.java
│   ├── CartController.java
│   ├── OrderController.java
│   ├── ReviewController.java
│   ├── WishlistController.java
│   ├── AddressController.java
│   ├── ShippingController.java
│   ├── CouponController.java
│   ├── AdminController.java
│   ├── AdminCouponController.java
│   └── UploadController.java
├── Service/          # Business logic interfaces (15)
│   ├── AuthenticationService / Impl
│   ├── CatalogService / Impl        # Product CRUD
│   ├── CategoryService / Impl
│   ├── CartService / Impl
│   ├── OrderService / Impl
│   ├── ReviewService / Impl
│   ├── WishlistService / Impl
│   ├── AddressService / Impl
│   ├── ShippingService / Impl
│   ├── CouponService / Impl
│   ├── AdminService / Impl
│   ├── UserService / Impl
│   ├── JwtService.java
│   ├── CustomUserDetailService.java
│   └── FileUploadService / CloudinaryUploadService
├── Repository/       # JPA repositories (15)
├── Model/            # JPA entities (13 entities + 2 converters)
├── DTO/
│   ├── request/      # Request DTOs
│   │   ├── admin/    # AssignRoleRequest, VerifySellerRequest, etc.
│   │   └── ecommerce/ # Product, Cart, Order, Review, Shipping DTOs
│   └── Response/     # Response DTOs
│       ├── User/
│       └── ecommerce/
├── Enum/             # 12 enum classes
├── Exception/        # AppException, ErrorCode, GlobalExceptionHandler
└── Mappers/          # MapStruct mappers (UserMapper, etc.)
```

### Design Patterns

| Pattern                      | Where Used                                  |
| ---------------------------- | ------------------------------------------- |
| **Layered Architecture**     | Controller → Service → Repository           |
| **DTO Pattern**              | Request/Response DTOs for all modules       |
| **Service Interface + Impl** | All business services                       |
| **Global Exception Handler** | `@ControllerAdvice` with domain error codes |
| **JWT Stateless Auth**       | Token-based, invalidated tokens blacklist   |
| **Optimistic Locking**       | `@Version` on ProductVariant, Coupon        |
| **MapStruct**                | Entity ↔ DTO mapping                        |

### Security Flow

```
Request → JwtAuthenticatedEntryPoint → jwtConverter (extract token)
  → JwtDecoderConfig (validate) → SecurityConfigV2 (role check)
  → Controller (or 401/403)
```

- JWT secret: HS256 symmetric key
- Access token: 6000ms (configurable, short for testing)
- Refresh token: 600000ms
- Logout: stores JWT ID in `invalidated_token` table

---

## 3. Frontend Architecture

### Directory Structure

```
Frontend/src/
├── main.jsx              # App entry, ReactDOM render
├── App.jsx               # Router setup, layout
├── index.css             # Global styles + Tailwind
├── App.css               # App-level styles
├── pages/                # Route-level components (20+ pages)
│   ├── LandingPage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CategoryPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── CheckoutPage.jsx
│   ├── MyOrdersPage.jsx
│   ├── OrderDetailPage.jsx
│   ├── UserProfilePage.jsx
│   ├── WishlistPage.jsx
│   ├── ReviewsPage.jsx
│   ├── NotFoundPage.jsx
│   ├── CreateProductPage.jsx
│   ├── SellerDashboardPage.jsx
│   ├── SellerProductsPage.jsx
│   ├── SellerOrdersPage.jsx
│   ├── SellerProfilePage.jsx
│   ├── SellerRegisterPage.jsx
│   ├── StorePage.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminProductsPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminReviewsPage.jsx
│       ├── AdminShippingsPage.jsx
│       └── AdminUsersPage.jsx
├── components/           # Reusable UI components (35+)
│   ├── Header.jsx, Footer.jsx, StoreHeader.jsx
│   ├── ProductSection.jsx, Products.jsx, ProductsToolbar.jsx
│   ├── FilterPanel.jsx, SearchFilterBar.jsx
│   ├── CartDrawer.jsx, CartButton.jsx
│   ├── BestSellersStrip.jsx, CategoriesStrip.jsx, CategoryNode.jsx
│   ├── WishlistButton.jsx, WishlistIconHeader.jsx, WishlistItem.jsx
│   ├── Hero.jsx, Features.jsx, Newsletter.jsx
│   ├── BrandLogo.jsx, AuthUserBadge.jsx
│   └── review/
│       ├── ReviewFlow.jsx
│       ├── ReviewChoiceModal.jsx
│       ├── ProductReviewCard.jsx
│       └── ReviewUploadZone.jsx
├── services/             # API service layer
│   ├── apiClient.js      # Fetch wrapper, JWT interceptors
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── orderService.js
│   ├── categoryService.js
│   ├── reviewService.js
│   ├── wishlistService.js
│   ├── shippingService.js
│   └── adminService.js
├── context/
│   └── CartContext.jsx   # Global cart state
├── constants/
│   ├── demoAccounts.js   # Seed credentials
│   └── orderStatus.js    # Order status mappings
└── utils/                # Utility helpers
```

### Routing Pattern

```
/                          → LandingPage
/products                  → ProductsPage
/products/:id              → ProductDetailPage
/categories                → CategoryPage (all)
/categories/:slug          → CategoryPage (specific)
/store/:sellerId           → StorePage
/login                     → LoginPage
/register                  → RegisterPage
/checkout                  → CheckoutPage (protected)
/my-orders                 → MyOrdersPage (protected)
/orders/:orderId           → OrderDetailPage (protected)
/profile                   → UserProfilePage (protected)
/wishlist                  → WishlistPage (protected)
/reviews/:productId        → ReviewsPage
/seller/dashboard          → SellerDashboardPage
/seller/products           → SellerProductsPage
/seller/orders             → SellerOrdersPage
/seller/profile            → SellerProfilePage
/seller/register           → SellerRegisterPage
/seller/products/create    → CreateProductPage
/admin/*                   → AdminLayout + nested routes
```

### State Management

- **Cart**: React Context (`CartContext.jsx`)
- **Auth**: Token in localStorage, user info in service
- **Other**: Local component state + props

### API Client (`apiClient.js`)

- Base URL: `http://localhost:8080` (configurable via `VITE_API_BASE`)
- JWT token attached via headers
- Response unwrapping: checks `response.ok` and `payload.success`
- Error propagation with status code

---

## 4. Data Flow Examples

### Checkout Flow

```
1. User clicks "Checkout" in CartDrawer
2. Frontend: CartContext → CheckoutPage (review cart items)
3. Frontend: User fills shipping info (recipient, phone, address, note)
4. POST /orders/checkout { ...shippingInfo, paymentMethod }
5. Backend: OrderServiceImpl.checkout()
   a. Validate cart not empty
   b. For each cart item:
      - Validate stock (variant or product level)
      - Create OrderItem with price snapshot
      - Decrement variant/product stock
   c. Calculate totalAmount, discountAmount, finalAmount
   d. Generate orderCode
   e. Clear cart
   f. Save Order with OrderItems
6. Return OrderResponse → Redirect to order detail
```

### Review Flow (Post-Purchase)

```
1. User clicks "Confirm Delivery" on order detail
2. POST /orders/{orderId}/confirm-delivery
3. Backend updates order status to DELIVERED
4. Frontend shows ReviewChoiceModal: "Rate now" / "Later"
5. If "Rate now":
   a. GET /orders/{orderId}/reviewable-items
   b. Show ReviewFlow with per-item review form
   c. For each item: star rating, title, comment, image upload
   d. POST /reviews { productId, orderId, variantId?, rating, title, comment, images }
6. After all reviews: badge "Reviewed" on items
```

### Variant Product Add-to-Cart

```
1. User browses products → clicks "Add to Cart" on product with variants
2. Frontend detects variants.length > 0
3. Redirects to /products/{id} with toast: "Please select options"
4. User selects variant options (e.g., Color: Red, Size: M)
5. Frontend resolves variantId from selected options
6. POST /cart/items { productId, variantId, quantity }
7. Backend CartServiceImpl.addItem():
   a. Validate product & variant
   b. itemPrice = variant.salePrice ?? variant.price
   c. Check variant.stock
   d. Create CartItem with variant reference + priceSnapshot
```

---

## 5. Key Design Decisions

| Decision                                  | Rationale                                               |
| ----------------------------------------- | ------------------------------------------------------- |
| Single `users` table with role field      | Simpler auth, avoids table inheritance                  |
| Variant as separate entity                | Independent stock, price, SKU per variant               |
| `priceSnapshot` on CartItem/OrderItem     | Historical price integrity                              |
| `orderCode` unique per order              | Human-readable order reference                          |
| `seller_id` on Order (not just OrderItem) | Supports single-seller-per-order model                  |
| JSON columns for attributes/images        | Flexible schema without join tables                     |
| `@Version` on ProductVariant/Coupon       | Prevent concurrent stock/coupon conflicts               |
| `ddl-auto: update`                        | Rapid development, suits early-stage project            |
| Cloudinary for images                     | No local file management                                |
| Short JWT duration (6000ms)               | Testing convenience, should be increased for production |

---

## 6. Deployment Architecture (Planned)

```
┌─────────────────────────────────────────────┐
│                  CDN (Cloudinary)            │
│              Static Assets / Images          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Azure App Service / Container App   │
│  ┌────────────────┐  ┌──────────────────┐   │
│  │  Frontend       │  │  Backend (JAR)   │   │
│  │  (Static Build) │  │  Spring Boot     │   │
│  └────────────────┘  └────────┬─────────┘   │
└───────────────────────────────┼─────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Azure MySQL / RDS   │
                    │   ecommerce DB        │
                    └───────────────────────┘
```
