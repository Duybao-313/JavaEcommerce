# 📋 Entity Updates Needed - Chi tiết

## Summary
Danh sách đầy đủ các trường cần thêm vào các entities hiện tại, và các entities mới cần tạo.

---

## 🔴 PRIORITY 1: IMMEDIATE UPDATES (HIGH)

### 1. User Entity - Thêm Seller Profile Fields
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/User.java`

**Trường cần thêm vào User entity:**
```java
// Seller Profile Fields
@Column(length = 255)
private String storeName;

@Column(length = 500)
private String storeLogo;

@Column(length = 500)
private String storeBanner;

@Column(length = 255)
private String businessLicense;

@Column(length = 255)
private String taxCode;

@Column(length = 500)
private String storeAddress;

@Column(length = 255)
private String bankAccount;

@Column(length = 255)
private String bankName;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private SellerVerificationStatus sellerVerified; // pending/approved/rejected

@Column(precision = 3, scale = 2)
private BigDecimal storeRating;

@Column(nullable = false)
private Integer totalSales = 0;

@Enumerated(EnumType.STRING)
private StoreStatus storeStatus; // active/suspended

// Verification Flags
@Column(nullable = false)
private Boolean emailVerified = false;

@Column(nullable = false)
private Boolean phoneVerified = false;

@Column(nullable = false)
private Boolean isActive = true;
```

**Enum cần tạo:**
- `SellerVerificationStatus` (pending, approved, rejected)
- `StoreStatus` (active, suspended)

**SQL Migration:**
```sql
ALTER TABLE users ADD COLUMN store_name VARCHAR(255);
ALTER TABLE users ADD COLUMN store_logo VARCHAR(500);
ALTER TABLE users ADD COLUMN store_banner VARCHAR(500);
ALTER TABLE users ADD COLUMN business_license VARCHAR(255);
ALTER TABLE users ADD COLUMN tax_code VARCHAR(255);
ALTER TABLE users ADD COLUMN store_address VARCHAR(500);
ALTER TABLE users ADD COLUMN bank_account VARCHAR(255);
ALTER TABLE users ADD COLUMN bank_name VARCHAR(255);
ALTER TABLE users ADD COLUMN seller_verified VARCHAR(50) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN store_rating DECIMAL(3,2);
ALTER TABLE users ADD COLUMN total_sales INT DEFAULT 0;
ALTER TABLE users ADD COLUMN store_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

---

## 🟡 PRIORITY 2: MEDIUM UPDATES

### 2. Product Entity - Thêm Optional Fields
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Product.java`

**Trường cần thêm:**
```java
@Column(uniqueConstraints = @UniqueConstraint(columnNames = "slug"))
private String slug;

@Column(nullable = true, precision = 19, scale = 2)
private BigDecimal salePrice;

@Column(nullable = true, precision = 10, scale = 2)
private BigDecimal weight;

@Column(length = 100)
private String sku;

@Column(nullable = false)
private Boolean isFeatured = false;
```

**SQL Migration:**
```sql
ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE products ADD COLUMN sale_price DECIMAL(19,2);
ALTER TABLE products ADD COLUMN weight DECIMAL(10,2);
ALTER TABLE products ADD COLUMN sku VARCHAR(100);
ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
```

### 3. Category Entity - Thêm Hierarchy & Display Fields
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Category.java`

**Trường cần thêm:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "parent_id")
private Category parent;

@Column(uniqueConstraints = @UniqueConstraint(columnNames = "slug"))
private String slug;

@Column(length = 500)
private String imageUrl;

@Column(nullable = false)
private Integer sortOrder = 0;

@Column(nullable = false)
private Boolean isActive = true;

@Column(nullable = false)
private LocalDateTime updatedAt;

@PreUpdate
public void preUpdate() {
    updatedAt = LocalDateTime.now();
}
```

**SQL Migration:**
```sql
ALTER TABLE categories ADD COLUMN parent_id BIGINT;
ALTER TABLE categories ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE categories ADD COLUMN image_url VARCHAR(500);
ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0;
ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE categories ADD FOREIGN KEY (parent_id) REFERENCES categories(id);
```

### 4. Order Entity - Thêm Tracking & Financial Info
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Order.java`

**Trường cần thêm:**
```java
@Column(unique = true, nullable = false)
private String orderCode;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "seller_id")
private User seller; // Nếu cần track seller cho multi-seller orders

@Column(nullable = true, precision = 19, scale = 2)
private BigDecimal discountAmount = BigDecimal.ZERO;

@Column(nullable = true, precision = 19, scale = 2)
private BigDecimal shippingFee = BigDecimal.ZERO;

@Column(nullable = true, precision = 19, scale = 2)
private BigDecimal finalAmount; // After discount and shipping

@Column(length = 500)
private String note;

@Column(nullable = true)
private LocalDateTime shippedAt;

@Column(nullable = true)
private LocalDateTime deliveredAt;
```

**SQL Migration:**
```sql
ALTER TABLE orders ADD COLUMN order_code VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE orders ADD COLUMN seller_id BIGINT;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(19,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(19,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN final_amount DECIMAL(19,2);
ALTER TABLE orders ADD COLUMN note VARCHAR(500);
ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE orders ADD FOREIGN KEY (seller_id) REFERENCES users(id);
```

### 5. Create Review Entity (NEW)
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Review.java` ⬅️ CREATE NEW

```java
package com.duybao.SplitGo.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String comment;

    @Column(columnDefinition = "json")
    private String images; // JSON array of image URLs

    @Column(nullable = false)
    private Boolean isApproved = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**SQL:**
```sql
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment VARCHAR(2000),
    images JSON,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 6. Create Wishlist Entity (NEW)
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Wishlist.java` ⬅️ CREATE NEW

```java
package com.duybao.SplitGo.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "wishlists", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
```

**SQL:**
```sql
CREATE TABLE wishlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE KEY uk_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 7. Create Address Entity (NEW)
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Address.java` ⬅️ CREATE NEW

```java
package com.duybao.SplitGo.Model;

import com.duybao.SplitGo.Enum.AddressType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String recipientName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 500)
    private String detail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType type; // home/office/other

    @Column(nullable = false)
    private Boolean isDefault = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Enum cần tạo:** `AddressType` (home, office, other)

**SQL:**
```sql
CREATE TABLE user_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    detail VARCHAR(500) NOT NULL,
    type ENUM('home', 'office', 'other') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 8. Create Shipping Entity (NEW)
**File**: `Backend/src/main/java/com/duybao/SplitGo/Model/Shipping.java` ⬅️ CREATE NEW

```java
package com.duybao.SplitGo.Model;

import com.duybao.SplitGo.Enum.ShippingStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "shippings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(unique = true, length = 50)
    private String trackingCode;

    @Column(nullable = false, length = 100)
    private String carrierName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShippingStatus status;

    @Column(nullable = false)
    private LocalDateTime estimatedDelivery;

    @Column(nullable = true)
    private LocalDateTime actualDelivery;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null) {
            status = ShippingStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Enum cần tạo:** `ShippingStatus` (pending, in_transit, out_for_delivery, delivered, failed)

**SQL:**
```sql
CREATE TABLE shippings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    tracking_code VARCHAR(50) UNIQUE,
    carrier_name VARCHAR(100) NOT NULL,
    status ENUM('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed') NOT NULL,
    estimated_delivery TIMESTAMP NOT NULL,
    actual_delivery TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🟢 PRIORITY 3: LOW (Optional - Nếu còn thời gian)

### 9. Create Coupon Entity (NEW)
### 10. Create CouponUsage Entity (NEW)
### 11. Create UserPermission Entity (NEW)
### 12. Create ActivityLog Entity (NEW)

*(Chi tiết có thể được thêm sau)*

---

## 📝 CHECKLIST

### Phase 1 - High Priority
- [ ] Update User entity with seller fields
- [ ] Create Enum: SellerVerificationStatus
- [ ] Create Enum: StoreStatus
- [ ] Run SQL migration for User

### Phase 2 - Medium Priority
- [ ] Update Product entity
- [ ] Update Category entity with parent_id, slug, etc.
- [ ] Update Order entity with tracking fields
- [ ] Create Review entity
- [ ] Create Enum: AddressType
- [ ] Create Address entity
- [ ] Create Enum: ShippingStatus
- [ ] Create Shipping entity
- [ ] Create Wishlist entity
- [ ] Run all SQL migrations

### Phase 3 - Low Priority
- [ ] Create Coupon entity
- [ ] Create CouponUsage entity
- [ ] Create UserPermission entity
- [ ] Create ActivityLog entity

---

## 🔗 Related Files to Update After Entity Creation
- `Repository/` - Tạo repositories cho entities mới
- `Service/` - Tạo services cho logic business
- `Controller/` - Tạo controllers cho REST endpoints
- `DTO/` - Tạo DTOs cho request/response
- `Mappers/` - Tạo mappers từ Entity <-> DTO

