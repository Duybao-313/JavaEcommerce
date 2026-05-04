# SplitGo E-commerce ERD (Enhanced)

## Mermaid ER Diagram

```mermaid
erDiagram
    USER {
        Long id PK
        String username UK
        String email UK
        String password
        Role role
        String fullName
        String phone
        String address
        String avatarUrl
    }
    
    CATEGORY {
        Long id PK
        String name UK
        String description
    }
    
    PRODUCT {
        Long id PK
        String name
        String description
        BigDecimal price
        Integer stock
        Long viewCount
        Long soldCount
        Long featuredImageId FK
        ProductStatus status
        User seller FK
        Category category FK
    }
    
    PRODUCT_IMAGE {
        Long id PK
        Long productId FK
        String imageUrl
        String altText
        ImageType imageType
        Integer displayOrder
        Boolean isActive
    }
    
    CART {
        Long id PK
        User user FK
    }
    
    CART_ITEM {
        Long id PK
        Cart cart FK
        Product product FK
        Integer quantity
        BigDecimal priceSnapshot
    }
    
    ORDER {
        Long id PK
        User buyer FK
        OrderStatus status
        PaymentMethod paymentMethod
        BigDecimal totalAmount
        String shippingAddress
    }
    
    ORDER_ITEM {
        Long id PK
        Order order FK
        Product product FK
        User seller FK
        String productName
        BigDecimal unitPrice
        Integer quantity
        BigDecimal lineTotal
    }
    
    NOTIFICATION {
        Long id PK
        String title
        String content
        NotificationType type
        User recipient FK
        User sender FK
        Boolean isRead
        LocalDateTime createdAt
        LocalDateTime readAt
    }
    
    %% Relationships
    USER ||--o{ PRODUCT : "sells"
    CATEGORY ||--o{ PRODUCT : "categorizes"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has images"
    USER ||--|| CART : "owns"
    CART ||--o{ CART_ITEM : "contains"
    CART_ITEM }o--|| PRODUCT : "references"
    USER ||--o{ ORDER : "buys"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }o--|| PRODUCT : "references"
    ORDER_ITEM }o--|| USER : "sold by"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ NOTIFICATION : "sends"
```

## Key Relationships

1. **User Roles**: ADMIN, USER(buyer), SELLER
2. **Product Ownership**: Seller(User) 1 → * Product
3. **Product Images**: Product 1 → * ProductImage (main + gallery images)
4. **Shopping Flow**: User → Cart (1:1) → CartItem (*:*) → Product
5. **Order Flow**: Buyer(User) → Order (1:*) → OrderItem (*:*) → Product + Seller(User)
6. **Notifications**: User receives notifications from system/sellers
7. **Multi-seller Orders**: OrderItem links both product & seller

## Enums

- **Role**: ADMIN, USER, SELLER
- **ProductStatus**: ACTIVE, INACTIVE, DRAFT
- **OrderStatus**: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- **PaymentMethod**: COD, BANK_TRANSFER, WALLET
- **NotificationType**: ORDER_UPDATE, SYSTEM, PROMOTION, SELLER_ALERT
- **ImageType**: MAIN, THUMBNAIL, GALLERY

## New Features Added

✅ **PRODUCT_IMAGE**: Supports main image + multiple gallery images with display order  
✅ **NOTIFICATION**: Complete notification system with read tracking  
✅ **Enhanced Enums**: More comprehensive status values for production use  

This enhanced ERD is now ready for scalable web development with image galleries and real-time notifications!