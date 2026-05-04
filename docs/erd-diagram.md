🎯 Tổng quan hệ thống

Copy code
Single Table USER (role: user/seller/admin) + Full E-Commerce Features
Hỗ trợ: Multi-seller, Admin Dashboard, Customer Management
Scale: 1M+ users, 10K+ orders/day
📊 Database Schema - SAU UPDATE (Theo codebase thực tế)
1. CORE - USER Entity (Hiện tại)
   mermaid

Copy code
erDiagram
USER {
    long id PK
    string username UK
    string email UK
    string password "NOT NULL"
    string fullName
    string phone
    string address
    string avatarUrl
    enum role "user/seller/admin" "NOT NULL"
    timestamp createdAt "NOT NULL"
    timestamp updatedAt
}

📌 TODO: Thêm các trường Seller-specific vào User entity:
- string store_name
- string store_logo
- string store_banner
- string business_license
- string tax_code
- string store_address
- string bank_account
- string bank_name
- enum seller_verified "pending/approved/rejected"
- decimal store_rating
- int total_sales
- enum store_status "active/suspended"
- bool email_verified "default: false"
- bool phone_verified "default: false"
- bool is_active "default: true"
2. PRODUCT & CATEGORY (Hiện tại)
   mermaid

Copy code
erDiagram
CATEGORY {
    long id PK
    string name UK "NOT NULL"
    string description
    timestamp createdAt "NOT NULL"
}

PRODUCT {
    long id PK
    long seller_id FK "NOT NULL"
    long category_id FK
    string name "NOT NULL"
    text description
    decimal price "NOT NULL"
    int stock "NOT NULL"
    long viewCount "NOT NULL"
    long soldCount "NOT NULL"
    string imageUrl "NOT NULL"
    enum status "ACTIVE/INACTIVE" "NOT NULL"
    timestamp createdAt "NOT NULL"
    timestamp updatedAt "NOT NULL"
}

USER ||--o{ PRODUCT : "sells"
CATEGORY ||--o{ PRODUCT : "categorizes"

📌 TODO: Thêm các trường vào CATEGORY:
- long parent_id FK (cho nested categories)
- string slug UK
- string imageUrl
- int sort_order
- bool is_active

📌 TODO: Thêm các trường vào PRODUCT:
- string slug UK
- decimal sale_price
- decimal weight
- string sku
- bool is_featured
3. ORDER SYSTEM (Hiện tại)
   mermaid

Copy code
erDiagram
ORDER {
    long id PK
    long buyer_id FK "NOT NULL"
    enum status "PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED" "NOT NULL"
    enum paymentMethod "COD/BANK_TRANSFER/E_WALLET" "NOT NULL"
    decimal totalAmount "NOT NULL"
    string shippingAddress "NOT NULL"
    timestamp createdAt "NOT NULL"
    timestamp updatedAt "NOT NULL"
}

ORDER_ITEM {
    long id PK
    long order_id FK "NOT NULL"
    long product_id FK "NOT NULL"
    long seller_id FK "NOT NULL"
    string productName "NOT NULL"
    decimal unitPrice "NOT NULL"
    int quantity "NOT NULL"
    decimal lineTotal "NOT NULL"
}

PAYMENT_TRANSACTION {
    long id PK
    long order_id FK "NOT NULL"
    enum method "COD/BANK_TRANSFER/E_WALLET" "NOT NULL"
    enum status "PENDING/SUCCESS/FAILED" "NOT NULL"
    decimal amount "NOT NULL"
    timestamp createdAt "NOT NULL"
}

USER ||--o{ ORDER : "customer"
ORDER ||--|{ ORDER_ITEM : "contains"
PRODUCT ||--o{ ORDER_ITEM : "ordered"
ORDER ||--|| PAYMENT_TRANSACTION : "has"

📌 TODO: Thêm các trường vào ORDER:
- string order_code UK
- long seller_id FK
- decimal discount_amount
- decimal shipping_fee
- decimal final_amount
- string note
- timestamp shipped_at
- timestamp delivered_at

📌 TODO: Tạo entity Shipping:
- long shipping_id PK
- long order_id FK
- string tracking_code
- string carrier_name
- enum status
- timestamp estimated_delivery
4. CUSTOMER FEATURES (Hiện tại & TODO)
   mermaid

Copy code
erDiagram
CART {
    long id PK
    long user_id FK UK "NOT NULL"
}

CART_ITEM {
    long id PK
    long cart_id FK "NOT NULL"
    long product_id FK "NOT NULL"
    int quantity "NOT NULL"
    decimal priceSnapshot "NOT NULL"
}

INVALIDATED_TOKEN {
    long id PK
    long user_id FK "NOT NULL"
    string token "NOT NULL"
    timestamp created_at "NOT NULL"
    timestamp expires_at "NOT NULL"
}

USER ||--o{ CART : "owns"
CART ||--|{ CART_ITEM : "contains"
PRODUCT ||--o{ CART_ITEM : "in_cart"
USER ||--o{ INVALIDATED_TOKEN : "has"

📌 TODO: Tạo entity Wishlist:
- long wishlist_id PK
- long user_id FK
- long product_id FK
- timestamp created_at

📌 TODO: Tạo entity Address:
- long address_id PK
- long user_id FK
- string recipient_name
- string phone
- json address_detail
- bool is_default
- enum type "home/office/other"
5. REVIEW & RATING (TODO: Chưa tạo)
   📌 TODO: Tạo entity Review:
   - long review_id PK
   - long product_id FK
   - long reviewer_id FK (User)
   - long order_id FK
   - int rating "1-5"
   - string title
   - text comment
   - json images
   - bool is_approved
   - timestamp created_at
   - timestamp updated_at
6. PROMOTION & COUPON (TODO: Chưa tạo)
   📌 TODO: Tạo entity Coupon:
   - long coupon_id PK
   - string code UK
   - enum discount_type "percentage/fixed"
   - decimal discount_value
   - decimal min_order_value
   - int max_usage
   - int usage_count
   - timestamp start_date
   - timestamp end_date
   - enum status "active/inactive/expired"
   - long created_by FK (User - seller/admin)
   - timestamp created_at
   - timestamp updated_at

   📌 TODO: Tạo entity CouponUsage:
   - long id PK
   - long coupon_id FK
   - long order_id FK
   - long customer_id FK ("User")
   - timestamp used_at
7. ADMIN & LOGGING (TODO: Chưa tạo)
   📌 TODO: Tạo entity UserPermission:
   - long id PK
   - long user_id FK
   - string permission_code
   - timestamp granted_at

   📌 TODO: Tạo entity ActivityLog:
   - long log_id PK
   - long user_id FK
   - string user_type "user/seller/admin"
   - string action "CREATE/UPDATE/DELETE/VIEW"
   - string table_name
   - long record_id
   - json old_values
   - json new_values
   - string ip_address
   - timestamp created_at
🔗 QUAN HỆ CHÍNH (SAU UPDATE)

Copy code
-- Seller & Products
USER (1) ────── N ── PRODUCT (seller_id)

-- Orders
USER (1) ────── N ── ORDER (buyer_id)
ORDER (1) ───── N ── ORDER_ITEM
ORDER (1) ───── 1 ── PAYMENT_TRANSACTION
PRODUCT (1) ── N ── ORDER_ITEM

-- Shopping Feature
USER (1) ────── 1 ── CART
CART (1) ────── N ── CART_ITEM
PRODUCT (1) ── N ── CART_ITEM
USER (1) ────── N ── INVALIDATED_TOKEN

-- Categories
CATEGORY (1) ── N ── PRODUCT
CATEGORY (1) ── N ── CATEGORY (parent_id - self-join)

-- Future: Reviews, Wishlist, Address...
USER (1) ────── N ── REVIEW/WISHLIST/ADDRESS (TODO)
PRODUCT (1) ── N ── REVIEW (TODO)
⚡ PERFORMANCE OPTIMIZATION
Indexes Critical:
sql

Copy code
-- User queries
CREATE INDEX idx_user_role_active ON users(role, is_active);
CREATE INDEX idx_user_seller_verified ON users(role, seller_verified) WHERE role = 'seller';

-- Product hot queries
CREATE INDEX idx_product_seller_status ON products(seller_id, status);
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_fts ON products USING GIN(to_tsvector('vietnamese', name || ' ' || description));

-- Order performance
CREATE INDEX idx_order_customer_status ON orders(customer_id, order_status, created_at);
CREATE INDEX idx_order_seller_status ON orders(seller_id, order_status);
🎭 ROLE-BASED FEATURES
Role | Features | Status
---|---|---
USER (Customer) | Cart, Order, Payment, View Products, (Review/Wishlist-TODO) | ✅ Implemented
SELLER | Product CRUD, Order Management, Store Profile | ⚠️ Partial
ADMIN | User/Seller Management, Dashboard, (Coupon/Logs-TODO) | ❌ Not Started

📋 CURRENT ENTITIES MAPPING (Java Models)
Entity | File | Status | Priority
---|---|---|---
User | User.java | ✅ Basic only - needs seller fields | 🔴 HIGH - Add seller profile fields
Product | Product.java | ✅ Implemented | 🟡 MID - Add slug, sale_price, weight, sku, is_featured
Category | Category.java | ✅ Basic only - needs parent_id, slug, sort_order, is_active | 🟡 MID - Add category hierarchy
Order | Order.java | ✅ Implemented (needs order_code, discount/shipping fees) | 🟡 MID - Add discounts/shipping detail
OrderItem | OrderItem.java | ✅ Implemented | ✅ DONE
Cart | Cart.java | ✅ Implemented | ✅ DONE
CartItem | CartItem.java | ✅ Implemented | ✅ DONE
PaymentTransaction | PaymentTransaction.java | ✅ Implemented | ✅ DONE
InvalidatedToken | InvalidatedToken.java | ✅ Implemented | ✅ DONE
Review | ❌ Missing | ⏳ 🟠 MID - Create Review.java
Wishlist | ❌ Missing | ⏳ 🟠 MID - Create Wishlist.java
Address | ❌ Missing | ⏳ 🟡 MID - Create Address.java
Shipping | ❌ Missing | ⏳ 🟠 MID - Create Shipping.java
Coupon | ❌ Missing | ⏳ 🟢 LOW - Create Coupon.java
CouponUsage | ❌ Missing | ⏳ 🟢 LOW - Create CouponUsage.java
UserPermission | ❌ Missing | ⏳ 🟢 LOW - Create UserPermission.java
ActivityLog | ❌ Missing | ⏳ 🟢 LOW - Create ActivityLog.java

## 🚀 IMPLEMENTATION ROADMAP

### PRIORITY 1 - HIGH (Cần ngay)
1. **USER Entity** - Thêm seller fields
   ```sql
   ALTER TABLE users ADD COLUMN store_name VARCHAR(255);
   ALTER TABLE users ADD COLUMN store_logo VARCHAR(500);
   ALTER TABLE users ADD COLUMN store_banner VARCHAR(500);
   ALTER TABLE users ADD COLUMN seller_verified ENUM('pending', 'approved', 'rejected');
   ALTER TABLE users ADD COLUMN store_status ENUM('active', 'suspended');
   ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
   ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
   ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
   ```

### PRIORITY 2 - MEDIUM (Cần sắp)
1. **CATEGORY Entity** - Thêm parent_id, slug, sort_order
2. **PRODUCT Entity** - Thêm slug, sale_price, weight, sku, is_featured
3. **ORDER Entity** - Thêm order_code, discount_amount, shipping_fee, final_amount
4. **Review Entity** - Create entity mới cho product reviews
5. **Wishlist Entity** - Create entity mới cho user wishlists
6. **Address Entity** - Create entity mới cho user addresses
7. **Shipping Entity** - Create entity mới cho order shipping tracking

### PRIORITY 3 - LOW (Nếu còn thời gian)
1. **Coupon & CouponUsage** - Promotion system
2. **UserPermission** - Permission/Role management
3. **ActivityLog** - Audit logging for admin
