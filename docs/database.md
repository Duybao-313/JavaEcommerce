# Database Schema — SplitGo

> **Engine**: MySQL | **JPA**: `ddl-auto: update` | **Last Updated**: 2026-05-31

---

## Entity-Relationship Overview

```
users ──┬── products (seller)      ──┬── product_variant
        │                             │
        ├── orders (buyer)           ──┬── order_items
        │   └── payment_transactions   │
        │   └── shippings              │
        │                              │
        ├── cart (1:1)               ──┬── cart_items
        │                              │
        ├── reviews                    │
        ├── wishlists                  │
        ├── addresses                  │
        └── invalidated_token          │

categories ── products
            └── categories (self-ref parent_id)
```

---

## Table Definitions

### 1. `users`

| Column             | Type         | Constraints             | Notes                       |
| ------------------ | ------------ | ----------------------- | --------------------------- |
| `id`               | BIGINT       | PK, AUTO_INCREMENT      |                             |
| `username`         | VARCHAR(255) | UNIQUE, NOT NULL        |                             |
| `email`            | VARCHAR(255) | UNIQUE, NOT NULL        |                             |
| `password`         | VARCHAR(255) | NOT NULL                | BCrypt hashed               |
| `full_name`        | VARCHAR(255) |                         |                             |
| `phone`            | VARCHAR(50)  |                         |                             |
| `address`          | VARCHAR(500) |                         | Buyer default address       |
| `avatar_url`       | VARCHAR(500) |                         | Cloudinary URL              |
| `role`             | ENUM         | NOT NULL                | USER, SELLER, ADMIN         |
| `created_at`       | DATETIME     | NOT NULL                |                             |
| `updated_at`       | DATETIME     |                         |                             |
| **Seller Profile** |              |                         |                             |
| `store_name`       | VARCHAR(255) |                         |                             |
| `store_logo`       | VARCHAR(500) |                         | Cloudinary URL              |
| `store_banner`     | VARCHAR(500) |                         | Cloudinary URL              |
| `store_address`    | VARCHAR(500) |                         |                             |
| `bank_account`     | VARCHAR(255) |                         |                             |
| `bank_name`        | VARCHAR(255) |                         |                             |
| `business_license` | VARCHAR(255) |                         |                             |
| `tax_code`         | VARCHAR(255) |                         |                             |
| `seller_verified`  | ENUM         |                         | PENDING, APPROVED, REJECTED |
| `store_rating`     | DECIMAL(3,2) |                         | Average rating              |
| `total_sales`      | INT          | NOT NULL, DEFAULT 0     |                             |
| `store_status`     | ENUM         |                         | ACTIVE, SUSPENDED           |
| **Verification**   |              |                         |                             |
| `email_verified`   | BOOLEAN      | NOT NULL, DEFAULT false |                             |
| `phone_verified`   | BOOLEAN      | NOT NULL, DEFAULT false |                             |
| `is_active`        | BOOLEAN      | NOT NULL, DEFAULT true  |                             |

### 2. `addresses`

| Column           | Type         | Constraints             | Notes                              |
| ---------------- | ------------ | ----------------------- | ---------------------------------- |
| `id`             | BIGINT       | PK, AUTO_INCREMENT      |                                    |
| `user_id`        | BIGINT       | FK → users.id, NOT NULL |                                    |
| `recipient_name` | VARCHAR(255) | NOT NULL                |                                    |
| `phone`          | VARCHAR(20)  | NOT NULL                | 10-11 digits                       |
| `detail`         | VARCHAR(500) | NOT NULL                | Full address detail                |
| `type`           | ENUM         | NOT NULL                | HOME, OFFICE, OTHER                |
| `is_default`     | BOOLEAN      | NOT NULL, DEFAULT false | Only one default per user at a time |
| `created_at`     | DATETIME     | NOT NULL                |                                    |
| `updated_at`     | DATETIME     |                         |                                    |

### 3. `categories`

| Column        | Type         | Constraints            | Notes                |
| ------------- | ------------ | ---------------------- | -------------------- |
| `id`          | BIGINT       | PK, AUTO_INCREMENT     |                      |
| `name`        | VARCHAR(255) | UNIQUE, NOT NULL       |                      |
| `description` | VARCHAR(512) |                        |                      |
| `parent_id`   | BIGINT       | FK → categories.id     | NULL = root category |
| `slug`        | VARCHAR(255) | UNIQUE                 | URL-friendly name    |
| `image_url`   | VARCHAR(500) |                        |                      |
| `sort_order`  | INT          | NOT NULL, DEFAULT 0    |                      |
| `is_active`   | BOOLEAN      | NOT NULL, DEFAULT true |                      |
| `created_at`  | DATETIME     | NOT NULL               |                      |
| `updated_at`  | DATETIME     |                        |                      |

### 4. `products`

| Column              | Type          | Constraints              | Notes                                       |
| ------------------- | ------------- | ------------------------ | ------------------------------------------- |
| `id`                | BIGINT        | PK, AUTO_INCREMENT       |                                             |
| `name`              | VARCHAR(255)  | NOT NULL                 |                                             |
| `description`       | VARCHAR(4000) |                          |                                             |
| `price`             | DECIMAL(19,2) | NOT NULL                 | Base price                                  |
| `sale_price`        | DECIMAL(19,2) |                          | Discount price                              |
| `stock`             | INT           | NOT NULL                 | Total stock (sum of variants if applicable) |
| `view_count`        | BIGINT        | NOT NULL, DEFAULT 0      |                                             |
| `sold_count`        | BIGINT        | NOT NULL, DEFAULT 0      |                                             |
| `image_url`         | VARCHAR(500)  | NOT NULL                 | Main product image                          |
| `status`            | ENUM          | NOT NULL, DEFAULT ACTIVE | ACTIVE, INACTIVE                            |
| `seller_id`         | BIGINT        | FK → users.id, NOT NULL  |                                             |
| `category_id`       | BIGINT        | FK → categories.id       |                                             |
| `slug`              | VARCHAR(255)  | UNIQUE                   |                                             |
| `weight`            | DECIMAL(10,2) |                          | kg                                          |
| `sku`               | VARCHAR(100)  |                          | Null if has variants                        |
| `is_featured`       | BOOLEAN       | NOT NULL, DEFAULT false  |                                             |
| `admin_note`        | VARCHAR(1000) |                          | Admin rejection reason                      |
| `status_updated_by` | BIGINT        |                          | Admin ID who updated status                 |
| `status_updated_at` | DATETIME      |                          |                                             |
| `created_at`        | DATETIME      | NOT NULL                 |                                             |
| `updated_at`        | DATETIME      | NOT NULL                 |                                             |

### 5. `product_variant`

| Column       | Type          | Constraints                | Notes                             |
| ------------ | ------------- | -------------------------- | --------------------------------- |
| `id`         | BIGINT        | PK, AUTO_INCREMENT         |                                   |
| `product_id` | BIGINT        | FK → products.id, NOT NULL |                                   |
| `sku`        | VARCHAR(100)  | UNIQUE                     | Variant SKU                       |
| `attributes` | TEXT (JSON)   |                            | e.g. `{"color":"Red","size":"M"}` |
| `price`      | DECIMAL(19,2) | NOT NULL                   |                                   |
| `sale_price` | DECIMAL(19,2) |                            |                                   |
| `stock`      | INT           | NOT NULL                   |                                   |
| `image_url`  | VARCHAR(500)  |                            | Variant-specific image            |
| `weight`     | DECIMAL(10,2) |                            |                                   |
| `version`    | BIGINT        | @Version                   | Optimistic locking                |

### 6. `carts`

| Column    | Type   | Constraints                     | Notes |
| --------- | ------ | ------------------------------- | ----- |
| `id`      | BIGINT | PK, AUTO_INCREMENT              |       |
| `user_id` | BIGINT | FK → users.id, UNIQUE, NOT NULL | 1:1   |

### 7. `cart_items`

| Column           | Type          | Constraints                       | Notes             |
| ---------------- | ------------- | --------------------------------- | ----------------- |
| `id`             | BIGINT        | PK, AUTO_INCREMENT                |                   |
| `cart_id`        | BIGINT        | FK → carts.id, NOT NULL           |                   |
| `product_id`     | BIGINT        | FK → products.id, NOT NULL        |                   |
| `variant_id`     | BIGINT        | FK → product_variant.id, NULLABLE |                   |
| `quantity`       | INT           | NOT NULL                          |                   |
| `price_snapshot` | DECIMAL(19,2) | NOT NULL                          | Price at add time |

### 8. `orders`

| Column             | Type          | Constraints               | Notes                                          |
| ------------------ | ------------- | ------------------------- | ---------------------------------------------- |
| `id`               | BIGINT        | PK, AUTO_INCREMENT        |                                                |
| `order_code`       | VARCHAR(255)  | UNIQUE, NOT NULL          | Generated                                      |
| `buyer_id`         | BIGINT        | FK → users.id, NOT NULL   |                                                |
| `seller_id`        | BIGINT        | FK → users.id             | Multi-seller support                           |
| `status`           | ENUM          | NOT NULL, DEFAULT PENDING | PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED |
| `order_status`     | ENUM          | DEFAULT PENDING           | **⚠ DUPLICATE FIELD — see Technical Debt**     |
| `payment_method`   | ENUM          | NOT NULL, DEFAULT COD     | COD, BANK_TRANSFER, E_WALLET                   |
| `total_amount`     | DECIMAL(19,2) | NOT NULL                  |                                                |
| `discount_amount`  | DECIMAL(19,2) | DEFAULT 0                 |                                                |
| `shipping_fee`     | DECIMAL(19,2) | DEFAULT 0                 |                                                |
| `final_amount`     | DECIMAL(19,2) |                           | total - discount + shipping                    |
| `shipping_address` | VARCHAR(500)  | NOT NULL                  |                                                |
| `phone`            | VARCHAR(50)   | NOT NULL                  |                                                |
| `recipient_name`   | VARCHAR(255)  |                           |                                                |
| `note`             | VARCHAR(500)  |                           |                                                |
| `shipped_at`       | DATETIME      |                           |                                                |
| `delivered_at`     | DATETIME      |                           |                                                |
| `created_at`       | DATETIME      | NOT NULL                  |                                                |
| `updated_at`       | DATETIME      | NOT NULL                  |                                                |

### 9. `order_items`

| Column               | Type          | Constraints                       | Notes                          |
| -------------------- | ------------- | --------------------------------- | ------------------------------ |
| `id`                 | BIGINT        | PK, AUTO_INCREMENT                |                                |
| `order_id`           | BIGINT        | FK → orders.id, NOT NULL          |                                |
| `product_id`         | BIGINT        | FK → products.id, NOT NULL        |                                |
| `variant_id`         | BIGINT        | FK → product_variant.id, NULLABLE |                                |
| `seller_id`          | BIGINT        | FK → users.id, NOT NULL           |                                |
| `product_name`       | VARCHAR(255)  | NOT NULL                          | Snapshot                       |
| `variant_attributes` | VARCHAR(200)  |                                   | JSON snapshot of variant attrs |
| `unit_price`         | DECIMAL(19,2) | NOT NULL                          |                                |
| `quantity`           | INT           | NOT NULL                          |                                |
| `line_total`         | DECIMAL(19,2) | NOT NULL                          | unitPrice × quantity           |

### 10. `payment_transactions`

| Column       | Type          | Constraints               | Notes                        |
| ------------ | ------------- | ------------------------- | ---------------------------- |
| `id`         | BIGINT        | PK, AUTO_INCREMENT        |                              |
| `order_id`   | BIGINT        | FK → orders.id, NOT NULL  |                              |
| `method`     | ENUM          | NOT NULL                  | COD, BANK_TRANSFER, E_WALLET |
| `status`     | ENUM          | NOT NULL, DEFAULT PENDING | PENDING, SUCCESS, FAILED     |
| `amount`     | DECIMAL(19,2) | NOT NULL                  |                              |
| `created_at` | DATETIME      | NOT NULL                  |                              |

### 11. `reviews`

| Column        | Type          | Constraints                       | Notes               |
| ------------- | ------------- | --------------------------------- | ------------------- |
| `id`          | BIGINT        | PK, AUTO_INCREMENT                |                     |
| `product_id`  | BIGINT        | FK → products.id, NOT NULL        |                     |
| `reviewer_id` | BIGINT        | FK → users.id, NOT NULL           |                     |
| `order_id`    | BIGINT        | FK → orders.id, NOT NULL          |                     |
| `variant_id`  | BIGINT        | FK → product_variant.id, NULLABLE |                     |
| `rating`      | INT           | NOT NULL                          | 1–5                 |
| `title`       | VARCHAR(255)  | NOT NULL                          |                     |
| `comment`     | VARCHAR(2000) |                                   |                     |
| `images`      | JSON          |                                   | Array of image URLs |
| `is_approved` | BOOLEAN       | NOT NULL, DEFAULT true            |                     |
| `created_at`  | DATETIME      | NOT NULL                          |                     |
| `updated_at`  | DATETIME      |                                   |                     |

### 12. `wishlists`

| Column       | Type     | Constraints                                  | Notes |
| ------------ | -------- | -------------------------------------------- | ----- |
| `id`         | BIGINT   | PK, AUTO_INCREMENT                           |       |
| `user_id`    | BIGINT   | FK → users.id, UNIQUE(user_id,product_id)    |       |
| `product_id` | BIGINT   | FK → products.id, UNIQUE(user_id,product_id) |       |
| `created_at` | DATETIME | NOT NULL                                     |       |

### 13. `shippings`

| Column               | Type         | Constraints                      | Notes                                                |
| -------------------- | ------------ | -------------------------------- | ---------------------------------------------------- |
| `id`                 | BIGINT       | PK, AUTO_INCREMENT               |                                                      |
| `order_id`           | BIGINT       | FK → orders.id, UNIQUE, NOT NULL | 1:1                                                  |
| `tracking_code`      | VARCHAR(50)  | UNIQUE                           |                                                      |
| `carrier_name`       | VARCHAR(100) | NOT NULL                         |                                                      |
| `status`             | ENUM         | NOT NULL, DEFAULT PENDING        | PENDING/IN_TRANSIT/OUT_FOR_DELIVERY/DELIVERED/FAILED |
| `estimated_delivery` | DATETIME     | NOT NULL                         |                                                      |
| `actual_delivery`    | DATETIME     |                                  |                                                      |
| `created_at`         | DATETIME     | NOT NULL                         |                                                      |
| `updated_at`         | DATETIME     |                                  |                                                      |

### 14. `coupon`

| Column                | Type          | Constraints        | Notes                             |
| --------------------- | ------------- | ------------------ | --------------------------------- |
| `id`                  | BIGINT        | PK, AUTO_INCREMENT |                                   |
| `code`                | VARCHAR(64)   | UNIQUE, NOT NULL   |                                   |
| `title`               | VARCHAR(255)  |                    |                                   |
| `description`         | TEXT          |                    |                                   |
| `type`                | ENUM          | NOT NULL           | PERCENTAGE, FIXED_AMOUNT          |
| `value`               | DECIMAL(19,2) |                    | Discount value                    |
| `max_discount_amount` | DECIMAL(19,2) |                    | Cap for PERCENTAGE type           |
| `min_order_value`     | DECIMAL(19,2) |                    | Min subtotal to apply             |
| `scope`               | ENUM          | DEFAULT ALL        | ALL, CATEGORY, PRODUCT, SELLER    |
| `target_ids_json`     | TEXT (JSON)   |                    | List of target IDs based on scope |
| `start_at`            | DATETIME      |                    |                                   |
| `end_at`              | DATETIME      |                    |                                   |
| `usage_limit`         | INT           |                    | Max total uses                    |
| `used_count`          | INT           | DEFAULT 0          |                                   |
| `is_active`           | BOOLEAN       | DEFAULT true       |                                   |
| `created_by`          | BIGINT        | FK → users.id      |                                   |
| `created_at`          | DATETIME      |                    |                                   |
| `updated_at`          | DATETIME      |                    |                                   |
| `version`             | BIGINT        | @Version           | Optimistic locking                |

### 15. `invalidated_token`

| Column        | Type         | Constraints | Notes            |
| ------------- | ------------ | ----------- | ---------------- |
| `id`          | VARCHAR(255) | PK          | JWT ID (jti)     |
| `expiry_time` | DATETIME     |             | Token expiration |

---

## Enums Reference

| Enum Class                 | Values                                                   |
| -------------------------- | -------------------------------------------------------- |
| `Role`                     | USER, SELLER, ADMIN                                      |
| `OrderStatus`              | PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED       |
| `PaymentStatus`            | PENDING, SUCCESS, FAILED                                 |
| `PaymentMethod`            | COD, BANK_TRANSFER, E_WALLET                             |
| `ProductStatus`            | ACTIVE, INACTIVE                                         |
| `SellerVerificationStatus` | PENDING, APPROVED, REJECTED                              |
| `StoreStatus`              | ACTIVE, SUSPENDED                                        |
| `AddressType`              | HOME, OFFICE, OTHER                                      |
| `ShippingStatus`           | PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED |
| `CouponType`               | PERCENTAGE, FIXED_AMOUNT                                 |
| `CouponScope`              | ALL, CATEGORY, PRODUCT, SELLER                           |
| `Carrier`                  | (carrier enum values)                                    |

---

## Indexes

| Table             | Index Type | Columns                    |
| ----------------- | ---------- | -------------------------- |
| `users`           | UNIQUE     | username, email            |
| `products`        | UNIQUE     | slug                       |
| `product_variant` | UNIQUE     | sku                        |
| `categories`      | UNIQUE     | name, slug                 |
| `orders`          | UNIQUE     | order_code                 |
| `shippings`       | UNIQUE     | order_id, tracking_code    |
| `wishlists`       | UNIQUE     | (user_id, product_id)      |
| `addresses`       | INDEX      | user_id                    |
| `coupon`          | UNIQUE     | code                       |
| `coupon`          | INDEX      | isActive, (startAt, endAt) |

---

## JPA Configuration (`application.yaml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: (HS256 key)
  token-duration: 6000 # 6 seconds (access)
  refresh-duration: 600000 # 600 seconds (refresh)
```
