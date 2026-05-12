# Functional Specification - JavaEcommerce (SplitGo)

## 1. Muc tieu

Xac dinh dac ta chuc nang cho he thong web ban hang (buyer + seller + admin), lam co so de implement/hoan thien code frontend-backend da co.

---

## 2. Pham vi

### In scope

- Dang ky / Dang nhap / Dang xuat / Refresh token
- Danh sach san pham + chi tiet san pham
- Gio hang: them/sua/xoa san pham
- Checkout tao don hang
- Seller CRUD san pham
- Admin thao tac quan tri co ban (vai tro/trang thai)

### Out of scope (phase sau)

- Thanh toan online gateway thuc te (VNPay/Momo/Stripe live)
- Khuyen mai phuc tap (voucher, campaign rules)
- Real-time inventory via event streaming

---

## 3. Vai tro nguoi dung

1. **Guest**
   - Xem landing, danh sach san pham, chi tiet
   - Dang ky / dang nhap
2. **Buyer**
   - Tat ca quyen guest
   - Them vao gio, checkout, xem don hang cua minh
3. **Seller**
   - Quan ly san pham cua minh (CRUD)
4. **Admin**
   - Quan tri user/role, theo doi du lieu tong quan he thong

---

## 4. Yeu cau chuc nang chi tiet

## 4.1 Authentication & Authorization

### UC-AUTH-01 Dang ky

- Input: username, password, thong tin profile co ban
- Validation:
  - username unique
  - password dat policy toi thieu
- Output: thong bao tao tai khoan thanh cong (hoac token neu backend support auto-login)

### UC-AUTH-02 Dang nhap

- Input: username, password
- Output: access token + refresh token (neu co)
- Frontend luu token va profile session

### UC-AUTH-03 Refresh token

- Frontend goi refresh khi access token het han
- Neu refresh fail -> logout session

### UC-AUTH-04 Phan quyen

- Route buyer/seller/admin duoc bao ve theo role
- API tra 401/403 dung chuan

---

## 4.2 Product Catalog

### UC-PROD-01 Xem danh sach san pham

- Ho tro phan trang/co ban
- Filter toi thieu: category, keyword (neu co)
- Tra ve danh sach item gom: id, name, image, price, status

### UC-PROD-02 Xem chi tiet san pham

- Du lieu: name, description, price, salePrice, stock, images, category, options (derived option types + values), variants (size, color...) voi gia/stock/image rieng
- Neu product co variants: hien thi variant selector (vd: chon color + size), gia/stock theo variant
- Hien thi trang thai con hang/het hang theo variant
- Options duoc derive tu variant attributes, tra ve cung ProductResponse

---

## 4.3 Cart

### UC-CART-01 Them vao gio hang

- Buyer da dang nhap
- Input: productId, quantity, variantId (optional, neu product co variants)
- Rule:
  - quantity > 0
  - khong vuot ton kho (stock cua variant neu co, hoac stock cua product)
  - Moi variant cua cung product duoc luu thanh cart item rieng

### UC-CART-02 Cap nhat so luong

- Input: cartItemId/productId + quantity moi
- Rule ton kho nhu tren

### UC-CART-03 Xoa khoi gio

- Input: cartItemId

### UC-CART-04 Lay gio hang hien tai

- Output:
  - danh sach item (gom variantId, variantAttributes neu co)
  - tong tien tam tinh

---

## 4.4 Checkout & Order

### UC-ORD-01 Checkout

- Input toi thieu:
  - shipping info
  - payment method
  - danh sach item tu cart
- Rule:
  - Validate ton kho truoc khi tao order
  - Tao order + orderItems
  - Cap nhat stock
  - Dat trang thai order ban dau

### UC-ORD-02 Xem don hang cua toi

- Buyer xem danh sach order cua minh + chi tiet

### UC-ORD-03 Cap nhat trang thai don (admin/seller)

- Trang thai tham khao: PENDING -> CONFIRMED -> SHIPPING -> DELIVERED / CANCELLED

---

## 4.5 Seller Product Management

### UC-SELL-01 Tao san pham

- Input: ten, mo ta, gia, so luong, category, image
- Validation:
  - gia > 0
  - so luong >= 0
- Ho tro tao kem variants (size, color) voi gia/stock/image rieng cho tung variant
  - **Quy trinh 2 buoc:**
    1. Seller dinh nghia option types (vd: `{name: "color", values: ["red","blue"]}`, `{name: "size", values: ["M","L","XL"]}`)
    2. He thong tu dong generate combinations (cartesian product) hoac seller tu nhap variant manually
  - Variant fields: sku, attributes (JSON: `{"color":"red","size":"XL"}`), price, salePrice, stock, imageUrl, weight
  - Neu co variants: product stock = sum(variant stocks), product sku = null
  - Moi variant phai co price > 0 va stock >= 0
  - SKU variant phai unique
  - **Server validation**: `validateOptionsAndVariants` dam bao:
    - Moi variant attributes chua tat ca option keys
    - Moi attribute value thuoc tap allowed values cua option tuong ung
    - Khong co duplicate attribute key trong cung variant

### UC-SELL-02 Sua san pham

- Chi cho phep owner seller hoac admin
- Co the cap nhat/them/xoa variants (replace strategy)

### UC-SELL-03 Xoa san pham

- Soft delete uu tien hon hard delete (neu architecture cho phep)

### UC-SELL-04 Danh sach san pham cua seller

- Hien thi theo seller dang nhap

## 4.6 Review Management

### UC-REV-01 Tao danh gia san pham

- Buyer da dang nhap va da mua san pham
- Input: `productId`, `orderId`, `rating`, `title`, `comment`, `images` (optional)
- Rule:
  - `rating` trong khoang 1-5
  - Khong duoc review trung cho cung order/product theo user

### UC-REV-02 Xem danh gia san pham

- Public co the xem danh sach review theo product
- Ho tro endpoint lay review da duyet

### UC-REV-03 Moderation danh gia

- Admin co quyen approve/reject review
- Buyer/Admin co the xoa review theo policy quyen

## 4.7 Wishlist Management

### UC-WISH-01 Them san pham vao wishlist

- Buyer da dang nhap
- Input: `productId`
- Rule: khong tao ban ghi trung (`userId + productId`)

### UC-WISH-02 Xoa san pham khoi wishlist

- Buyer da dang nhap
- Input: `productId`

### UC-WISH-03 Xem va kiem tra wishlist

- Buyer xem danh sach wishlist cua minh
- Co endpoint check nhanh 1 product da trong wishlist hay chua

## 4.8 Shipping Tracking

### UC-SHIP-01 Tao va cap nhat shipping

- Seller/Admin tao shipping cho order
- Input tao moi: `orderId`, `carrierName`, `estimatedDelivery`, `trackingCode` (optional)
- Input cap nhat: `status`, `trackingCode`, `carrierName`, `estimatedDelivery`, `actualDelivery`

### UC-SHIP-02 Theo doi don hang

- Lay shipping theo `orderId`
- Track theo `trackingCode`

### UC-SHIP-03 Chuyen trang thai van chuyen

- Seller/Admin co endpoint mark in-transit va mark delivered
- Khi delivered co the cap nhat thoi gian giao thuc te

---

## 5. API Contract (muc logic, can map lai endpoint thuc te)

## 5.1 Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## 5.2 Product/Category

- `GET /products`
- `GET /products/{id}`
- `GET /products/{id}/variants` (danh sach variant cua product)
- `POST /products` (seller/admin, multipart: co the gui options JSON + variants JSON + image)
- `PUT /products/{id}` (owner/admin, co the update variants)
- `PUT /products/{id}/image` (owner/admin)
- `DELETE /products/{id}` (owner/admin)
- `GET /categories`

## 5.3 Cart

- `GET /cart`
- `POST /cart/items` (body: `{productId, quantity, variantId?}`)
- `PUT /cart/items/{itemId}`
- `DELETE /cart/items/{itemId}`

Cart item response bo sung: `variantId`, `variantAttributes`, `imageUrl`

## 5.4 Orders

- `POST /orders/checkout`
- `GET /orders/my`
- `GET /orders/{id}`
- `PATCH /orders/{id}/status` (seller/admin)

OrderItem bo sung: `variantId`, `variantAttributes`

## 5.5 Reviews

- `POST /reviews` (user)
- `GET /reviews/product/{productId}`
- `GET /reviews/product/{productId}/approved`
- `GET /reviews/user/{userId}`
- `DELETE /reviews/{reviewId}` (user/admin)
- `POST /reviews/{reviewId}/approve` (admin)
- `POST /reviews/{reviewId}/reject` (admin)

## 5.6 Wishlist

- `POST /wishlist` (user)
- `DELETE /wishlist/{productId}` (user)
- `GET /wishlist` (user)
- `GET /wishlist/check/{productId}` (user)

## 5.7 Shipping

- `POST /shippings` (seller/admin)
- `PUT /shippings/{shippingId}` (seller/admin)
- `GET /shippings/order/{orderId}`
- `GET /shippings/track?trackingCode={trackingCode}`
- `POST /shippings/{shippingId}/mark-delivered` (seller/admin)
- `POST /shippings/{shippingId}/mark-in-transit` (seller/admin)

## 5.8 Payload fields cap nhat (DTO contract snapshot)

### Product create/update

- Bo sung field: `salePrice`, `weight`, `sku`, `isFeatured`
- Field cu van giu: `name`, `description`, `imageUrl`, `price`, `stock`, `categoryId`, `categoryName`
- **Options (moi)**: `options[]` - danh sach option types do seller dinh nghia:
  - `name` (string, required, vd: "color", "size")
  - `values` (List<String>, required, vd: ["red","blue"])
  - `required` (boolean, default true)
- **Variants (moi)**: `variants[]` - danh sach bien the, moi variant gom:
  - `sku` (string, unique, optional)
  - `attributes` (Map<String,String>, vd: `{"color":"red","size":"XL"}`)
  - `price` (BigDecimal, required)
  - `salePrice` (BigDecimal, optional)
  - `stock` (Integer, required)
  - `imageUrl` (string, optional)
  - `weight` (BigDecimal, optional)

### Product response

- Bo sung fields: `salePrice`, `weight`, `sku`, `isFeatured`, `variants[]`
- Moi variant trong response: `id`, `sku`, `attributes`, `price`, `salePrice`, `stock`, `imageUrl`, `weight`

### Category create/update

- Bo sung field: `parentId`, `imageUrl`, `sortOrder`, `isActive`
- Field co ban: `name`, `description`

### Checkout request

- Bo sung field: `paymentMethod`, `note`
- Field co ban: `shippingAddress`

### Update user profile

- Bo sung seller profile fields trong `UpdateUserRequest`:
  - `avatarUrl`, `storeName`, `storeLogo`, `storeBanner`, `businessLicense`, `taxCode`, `storeAddress`, `bankAccount`, `bankName`

> Luu y: Ten endpoint can doi chieu voi controller hien tai trong backend.

> Luu y bo sung: `Address` DTO da co trong source, nhung module API Address chua thay trong danh sach controller hien tai.

---

## 6. Non-functional requirements

1. **Security**
   - JWT auth, hash password an toan, validate input
2. **Performance**
   - API list san pham co phan trang
3. **Reliability**
   - Error response thong nhat (ma loi + message)
4. **Usability**
   - Frontend co loading/empty/error state ro rang
5. **Maintainability**
   - Tach service layer frontend, DTO/backend ro rang

---

## 7. UI/UX yeu cau toi thieu

- Header co search/cart/auth action
- Product cards dong nhat
- Product detail co CTA "Them vao gio"
- Neu product co variants: hien thi variant selector (size buttons), gia/stock thay doi theo variant chon
- Seller form tao product co section "Biến thể" de them size/color voi gia/stock rieng
- Cart hien thi variant attributes (vd: "Size: XL") neu co

---

## 8. Product Variant Architecture

### 8.1 Thiet ke du lieu

- `Product`: thong tin chung (name, description, category, seller...), stock = sum(variant stocks)
- `ProductVariant`: moi record = 1 variant cu the (size XL, color red...)
  - Fields: id, product_id (FK), sku (unique), attributes (JSON: size/color), price, salePrice, stock, imageUrl, weight
  - `@Version` field cho optimistic locking
- `attributes` duoc luu duoi dang JSON TEXT, dung `JsonMapConverter` (JPA AttributeConverter) de serialize/deserialize

### 8.2 Stock safety

- Decrement stock: `UPDATE product_variant SET stock = stock - :qty WHERE id = :id AND stock >= :qty` — kiem tra affectedRows
- Optimistic locking: `ProductVariant` co `@Version`, xu ly `OptimisticLockException` voi retry
- CartItem va OrderItem co tham chieu den `variantId` de truy vet chinh xac variant da mua

### 8.3 API

- `POST /products` (multipart): nhan `variants` JSON string + image file, parse qua `@RequestParam`
- `GET /products/{id}/variants`: lay danh sach variant cua product
- `POST /cart/items`: body `{productId, quantity, variantId?}`
- CartItemResponse bo sung: `variantId`, `variantAttributes`, `imageUrl`

### 8.4 Validation

- Neu `variants` khong rong: moi variant BAT BUOC co `price > 0` va `stock >= 0`
- SKU variant phai unique (server enforce)
- Neu co variants, product-level `sku` = null, `stock` = sum(variant stocks)
- Khong cho phep gia am, stock am
- Cart drawer/page hien tong tien
- Checkout form ro rang
- Trang seller :
  +co layout rieng
  +bang san pham

* form tao/sua
  +lich su mua hang
* dash board

- Trang seller :
  +co layout rieng

* phan quyen
  +quan ly user
* dash board

---

## 8. Acceptance Criteria (MVP)

1. User dang ky/dang nhap thanh cong va giu session.
2. User xem duoc danh sach + chi tiet san pham.
3. User them/sua/xoa gio hang khong loi business rule.
4. User checkout tao order thanh cong.
5. Seller tao/sua/xoa san pham thanh cong.
6. Loi API duoc hien thi ro tren frontend.

---

## 9. Ke hoach trien khai de xuat (ngan)

### Phase 1 (Core buyer flow)

- Auth + product list/detail + cart + checkout

### Phase 2 (Seller flow)

- CRUD product + upload image + seller dashboard

### Phase 3 (Hardening)

- Error handling, role guard, test integration, polish UI

---

## 10. Tracking task

- Tai lieu context: `docs/context.md`
- Tai lieu spec: `docs/spec.md`
- Co the bo sung tiep:
  - `docs/api-mapping.md` (map frontend service -> backend endpoint thuc te)
  - `docs/test-cases.md` (test case theo UC)
