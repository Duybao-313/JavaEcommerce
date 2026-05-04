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

- Du lieu: name, description, price, stock, images, category
- Hien thi trang thai con hang/het hang

---

## 4.3 Cart

### UC-CART-01 Them vao gio hang

- Buyer da dang nhap
- Input: productId, quantity
- Rule:
  - quantity > 0
  - khong vuot ton kho

### UC-CART-02 Cap nhat so luong

- Input: cartItemId/productId + quantity moi
- Rule ton kho nhu tren

### UC-CART-03 Xoa khoi gio

- Input: cartItemId

### UC-CART-04 Lay gio hang hien tai

- Output:
  - danh sach item
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

### UC-SELL-02 Sua san pham

- Chi cho phep owner seller hoac admin

### UC-SELL-03 Xoa san pham

- Soft delete uu tien hon hard delete (neu architecture cho phep)

### UC-SELL-04 Danh sach san pham cua seller

- Hien thi theo seller dang nhap

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
- `POST /products` (seller/admin)
- `PUT /products/{id}` (owner/admin)
- `DELETE /products/{id}` (owner/admin)
- `GET /categories`

## 5.3 Cart

- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/{itemId}`
- `DELETE /cart/items/{itemId}`

## 5.4 Orders

- `POST /orders/checkout`
- `GET /orders/my`
- `GET /orders/{id}`
- `PATCH /orders/{id}/status` (seller/admin)

> Luu y: Ten endpoint can doi chieu voi controller hien tai trong backend.

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
- Cart drawer/page hien tong tien
- Checkout form ro rang
- Trang seller :
+co layout rieng 
+bang san pham 
+ form tao/sua
+lich su mua hang
+ dash board
- Trang seller :
+co layout rieng  
+ phan quyen
+quan ly user
+ dash board
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
