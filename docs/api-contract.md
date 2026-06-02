# API Contract — SplitGo

> **Base URL**: `http://localhost:8080` | **Content-Type**: `application/json` | **Auth**: Bearer JWT

---

## API Response Envelope

All endpoints return:

```json
{
  "success": true,
  "code": 200,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-05-31T10:00:00"
}
```

Paginated responses use `PageResponse<T>`:

```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "pageSize": 12
}
```

---

## 1. Authentication — `/auth`

### `POST /auth/register`

- **Auth**: None
- **Body**: `{ username, email, password, fullName, phone? }`
- **Response**: `RegisterResponse { user, token? }`

### `POST /auth/login`

- **Auth**: None
- **Body**: `{ username, password }`
- **Response**: `AuthResponse { user, accessToken, refreshToken }`

### `GET /auth/userdetail`

- **Auth**: Bearer token
- **Response**: `UserDTO { id, username, email, fullName, phone, role, avatarUrl, ...sellerFields }`

### `PUT /auth/userdetail`

- **Auth**: Bearer token
- **Body**: `UpdateUserRequest { fullName, phone, address? }`
- **Response**: `UserDTO`

### `POST /auth/logout`

- **Auth**: Bearer token
- **Body**: `{ token }`
- **Response**: `Void`

### `POST /auth/refresh`

- **Auth**: None
- **Body**: `{ token }` (refresh token)
- **Response**: `RefreshToken { token, expiryTime }`

### `POST /auth/change-password`

- **Auth**: Bearer token
- **Body**: `{ oldPass, newPass1, newPass2 }`
- **Response**: `Void`

### `POST /auth/forgot-password`

- **Auth**: None
- **Body**: `{ email }`
- **Response**: `{ success: true, message: "Email đặt lại mật khẩu đã được gửi" }`

### `POST /auth/reset-password`

- **Auth**: None
- **Body**: `{ token, newPassword, confirmPassword }`
- **Response**: `Void`

### `POST /auth/verify-email`

- **Auth**: None
- **Params**: `token` (verification token)
- **Response**: `Void` — sets `emailVerified = true`

### `POST /auth/resend-verification`

- **Auth**: Bearer token
- **Response**: `Void` — gửi lại email xác thực

### `POST /auth/avatar` (multipart)

- **Auth**: Bearer token
- **Body**: `avatar` (file part)
- **Response**: `UserDTO`

### Seller Profile

| Method | Endpoint                    | Auth   | Description                     |
| ------ | --------------------------- | ------ | ------------------------------- |
| GET    | `/auth/seller/profile`      | SELLER | Get own seller profile          |
| PUT    | `/auth/seller/profile`      | SELLER | Update store info               |
| POST   | `/auth/seller/store-logo`   | SELLER | Upload store logo (multipart)   |
| POST   | `/auth/seller/store-banner` | SELLER | Upload store banner (multipart) |
| GET    | `/auth/sellers/{sellerId}`  | None   | Public seller profile           |

---

## 2. Products — `/products`

### `GET /products`

- **Auth**: None
- **Params**: `categoryId?`, `page` (default 0), `size` (default 12)
- **Response**: `PageResponse<ProductResponse>`

### `GET /products/admin`

- **Auth**: ADMIN
- **Params**: `page`, `size`, `status?`
- **Response**: `PageResponse<ProductResponse>`

### `GET /products/seller/{sellerId}`

- **Auth**: SELLER (own products only)
- **Params**: `page`, `size`
- **Response**: `PageResponse<ProductResponse>`

### `GET /products/store/{sellerId}`

- **Auth**: None
- **Params**: `page`, `size` (24), `sort` (soldDesc)
- **Response**: `PageResponse<ProductResponse>`

### `GET /products/store/{sellerId}/best-sellers`

- **Auth**: None
- **Params**: `limit` (default 8)
- **Response**: `List<ProductResponse>`

### `GET /products/{id}`

- **Auth**: None
- **Response**: `ProductResponse` (includes options[], variants[])

### `POST /products` (multipart)

- **Auth**: SELLER or ADMIN
- **Body**: `CreateProductRequest` fields + `image` (file) + `variants` (JSON string) + `options` (JSON string)
- **Response**: `ProductResponse`

### `PUT /products/{id}`

- **Auth**: SELLER or ADMIN
- **Body**: `UpdateProductRequest`
- **Response**: `ProductResponse`

### `DELETE /products/{id}`

- **Auth**: SELLER (own) or ADMIN
- **Response**: `Void`

### `PATCH /products/{id}/status`

- **Auth**: ADMIN
- **Body**: `UpdateProductStatusRequest { status, adminNote? }`
- **Response**: `ProductResponse`

---

## 3. Categories — `/categories`

### `GET /categories`

- **Auth**: None
- **Response**: `List<CategoryResponse>` (flat list)

### `GET /categories/roots`

- **Auth**: None
- **Response**: `List<CategoryResponse>` (only root categories)

### `GET /categories/tree`

- **Auth**: ADMIN
- **Response**: `List<CategoryResponse>` (nested tree)

### `GET /categories/{id}/product-count`

- **Auth**: None
- **Response**: `Long`

### `POST /categories`

- **Auth**: ADMIN
- **Params**: `parentId?`
- **Body**: `CreateCategoryRequest { name, description, slug, imageUrl, sortOrder, isActive }`
- **Response**: `CategoryResponse`

### `PUT /categories/{id}`

- **Auth**: ADMIN
- **Body**: `CreateCategoryRequest`
- **Response**: `CategoryResponse`

### `DELETE /categories/{id}`

- **Auth**: ADMIN
- **Response**: `Void` (validates no children/products)

---

## 4. Cart — `/cart`

> All endpoints require **USER** role.

### `GET /cart`

- **Response**: `CartResponse { id, items: CartItemResponse[] }`

### `POST /cart/items`

- **Body**: `AddCartItemRequest { productId, quantity, variantId? }`
- **Response**: `CartResponse`

### `PUT /cart/items/{cartItemId}`

- **Body**: `UpdateCartItemRequest { quantity }`
- **Response**: `CartResponse`

### `DELETE /cart/items/{cartItemId}`

- **Response**: `CartResponse`

---

## 5. Orders — `/orders`

### `POST /orders/checkout`

- **Auth**: USER
- **Body**: `CheckoutRequest { shippingAddress, phone, recipientName, paymentMethod, note?, couponCode? }`
- **Response**: `OrderResponse`

### `GET /orders/my`

- **Auth**: USER
- **Response**: `List<OrderResponse>`

### `GET /orders/{orderId}`

- **Auth**: USER, SELLER, or ADMIN
- **Response**: `OrderResponse`

### `POST /orders/{orderId}/cancel`

- **Auth**: USER
- **Response**: `OrderResponse`

### `POST /orders/{orderId}/confirm-delivery`

- **Auth**: USER
- **Response**: `OrderResponse`

### `GET /orders/{orderId}/reviewable-items`

- **Auth**: USER
- **Response**: `List<ReviewableItemResponse>`

### `GET /seller/orders`

- **Auth**: SELLER
- **Response**: `List<OrderResponse>`

### `GET /orders`

- **Auth**: ADMIN
- **Response**: `List<OrderResponse>` (all orders)

### `PATCH /orders/{orderId}/status`

- **Auth**: SELLER or ADMIN
- **Body**: `UpdateOrderStatusRequest { status }`
- **Response**: `OrderResponse`

### `PATCH /seller/orders/{orderId}/status`

- **Auth**: SELLER
- **Body**: `UpdateOrderStatusRequest { status }`
- **Response**: `OrderResponse`

### `POST /seller/orders/{orderId}/cancel`

- **Auth**: SELLER
- **Response**: `OrderResponse`

---

## 6. Reviews — `/reviews`

### `POST /reviews`

- **Auth**: USER
- **Body**: `CreateReviewRequest { productId, orderId, rating, title, comment?, images?, variantId? }`
- **Response**: `ReviewResponse`

### `GET /reviews/admin`

- **Auth**: ADMIN
- **Response**: `List<ReviewResponse>`

### `GET /reviews/product/{productId}`

- **Auth**: None
- **Response**: `List<ReviewResponse>` (all reviews)

### `GET /reviews/product/{productId}/approved`

- **Auth**: None
- **Response**: `List<ReviewResponse>` (approved only)

### `GET /reviews/product/{productId}/summary`

- **Auth**: None
- **Response**: `ProductReviewSummaryResponse { averageRating, totalReviews, distribution }`

### `GET /reviews/user/{userId}`

- **Auth**: None
- **Response**: `List<ReviewResponse>`

### `DELETE /reviews/{reviewId}`

- **Auth**: USER (own) or ADMIN
- **Response**: `String`

### Admin Review Actions

| Method | Endpoint                            | Auth  | Description    |
| ------ | ----------------------------------- | ----- | -------------- |
| PATCH  | `/admin/reviews/{reviewId}/approve` | ADMIN | Approve review |
| PATCH  | `/admin/reviews/{reviewId}/reject`  | ADMIN | Reject review  |

---

## 7. Wishlist — `/wishlist`

> All endpoints require **USER** role.

### `POST /wishlist`

- **Body**: `CreateWishlistRequest { productId }`
- **Response**: `WishlistResponse`

### `DELETE /wishlist/{productId}`

- **Response**: `WishlistResponse`

### `GET /wishlist`

- **Response**: `List<WishlistResponse>`

### `GET /wishlist/check/{productId}`

- **Response**: `Boolean`

---

## 8. Shipping — `/shippings`

### `GET /shippings`

- **Auth**: SELLER or ADMIN
- **Response**: `List<ShippingResponse>`

### `POST /shippings`

- **Auth**: SELLER or ADMIN
- **Body**: `CreateShippingRequest { orderId, trackingCode, carrierName, estimatedDelivery }`
- **Response**: `ShippingResponse`

### `PUT /shippings/{shippingId}`

- **Auth**: SELLER or ADMIN
- **Body**: `UpdateShippingRequest { trackingCode?, carrierName?, status?, estimatedDelivery?, actualDelivery? }`
- **Response**: `ShippingResponse`

### `GET /shippings/order/{orderId}`

- **Auth**: SELLER or ADMIN
- **Response**: `ShippingResponse`

### `GET /shippings/track?trackingCode={code}`

- **Auth**: SELLER or ADMIN
- **Response**: `ShippingResponse`

### `POST /shippings/{shippingId}/mark-delivered`

- **Auth**: USER or ADMIN
- **Response**: `String`

### `POST /shippings/{shippingId}/mark-in-transit`

- **Auth**: SELLER or ADMIN
- **Response**: `String`

---

## 9. Address Book — `/addresses`

> All endpoints require **USER** role.

### `GET /addresses`

- **Auth**: USER
- **Response**: `List<AddressResponse>`

### `POST /addresses`

- **Auth**: USER
- **Body**: `CreateAddressRequest { recipientName, phone, detail, type, isDefault? }`
- **Response**: `AddressResponse`
- **Note**: Max 10 addresses per user. If `isDefault=true`, auto-unsets previous default.

### `PUT /addresses/{id}`

- **Auth**: USER
- **Body**: `UpdateAddressRequest { recipientName?, phone?, detail?, type?, isDefault? }`
- **Response**: `AddressResponse`

### `DELETE /addresses/{id}`

- **Auth**: USER
- **Response**: `Void`
- **Note**: Cannot delete the only default address if it's the last address.

### `PATCH /addresses/{id}/default`

- **Auth**: USER
- **Response**: `AddressResponse`
- **Note**: Sets this address as default, automatically unsets previous default.

---

## 10. Coupons — `/coupons` + `/admin/coupons`

### Public

| Method | Endpoint                    | Auth | Description                                        |
| ------ | --------------------------- | ---- | -------------------------------------------------- |
| GET    | `/coupons/public?page&size` | None | List active public coupons                         |
| GET    | `/coupons/code/{code}`      | None | Lookup coupon by code                              |
| POST   | `/coupons/validate`         | None | `ValidateCouponRequest` → `ValidateCouponResponse` |

### Admin

| Method | Endpoint                            | Auth  | Description              |
| ------ | ----------------------------------- | ----- | ------------------------ |
| GET    | `/admin/coupons?page&size&q&active` | ADMIN | List all coupons         |
| POST   | `/admin/coupons`                    | ADMIN | Create coupon            |
| GET    | `/admin/coupons/{id}`               | ADMIN | Get coupon detail        |
| PUT    | `/admin/coupons/{id}`               | ADMIN | Update coupon            |
| PATCH  | `/admin/coupons/{id}`               | ADMIN | Partial update (toggle)  |
| DELETE | `/admin/coupons/{id}`               | ADMIN | Soft delete (deactivate) |

---

## 11. Admin — `/admin`

> All endpoints require **ADMIN** role.

### `GET /admin/users?search&role&isActive&page&size&sortBy&sortDir`

- **Response**: `{ content: UserDTO[], totalElements, totalPages, currentPage, pageSize }`

### `GET /admin/users/{userId}`

- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}`

- **Body**: `UpdateUserRequest`
- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}/role`

- **Body**: `AssignRoleRequest { role }`
- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}/role/remove`

- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}/seller/verify`

- **Body**: `VerifySellerRequest { status }`
- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}/store/status`

- **Body**: `StoreStatusRequest { status }`
- **Response**: `UserDTO`

### `PATCH /admin/users/{userId}/active`

- **Body**: `ToggleActiveRequest { isActive }`
- **Response**: `UserDTO`

### `DELETE /admin/users/{userId}`

- **Response**: `204 No Content`

### `GET /admin/orders/{orderId}`

- **Response**: `OrderResponse`

---

## 11. Upload — `/upload`

### `POST /upload/image` (multipart)

- **Auth**: SELLER or ADMIN
- **Body**: `image` (file part)
- **Response**: `{ imageUrl: "https://..." }`

---

## Error Response Format

```json
{
  "success": false,
  "code": 400,
  "message": "Error description",
  "errors": { "field": "Validation message" }
}
```

### Common Error Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 400  | Validation error / bad request       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (insufficient role)        |
| 404  | Resource not found                   |
| 409  | Conflict (duplicate, stock issue)    |
| 500  | Internal server error                |

Domain-specific error codes are defined in `ErrorCode.java` (50+ codes).
