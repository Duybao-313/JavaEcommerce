# Project Context - JavaEcommerce (SplitGo)

## 1) Tong quan du an

Du an la he thong web ban hang gom 2 phan:

- **Backend**: Spring Boot (Java), cau truc domain ecommerce day du (user, product, category, cart, order, payment, auth).
- **Frontend**: React + Vite, da co cac trang va service co ban cho ecommerce flow.

Muc tieu hien tai: **tao tai lieu context + spec** de thong nhat pham vi, kien truc, API flow va ke hoach phat trien tiep theo.

---

## 2) Cau truc thu muc chinh

### Backend

- `Backend/src/main/java/com/duybao/SplitGo/Config`: cau hinh bao mat, JWT, khoi tao du lieu, cloudinary...
- `Backend/src/main/java/com/duybao/SplitGo/Controller`: API controllers (Authentication, Product, Category, Cart, Order, Admin)
- `Backend/src/main/java/com/duybao/SplitGo/Service` + `Service/Impl`: business logic
- `Backend/src/main/java/com/duybao/SplitGo/Repository`: JPA repositories
- `Backend/src/main/java/com/duybao/SplitGo/Model`: entities (User, Product, Cart, Order...)
- `Backend/src/main/java/com/duybao/SplitGo/DTO`: request/response models
- `Backend/src/main/resources/application.yaml`: cau hinh app
- `Backend/src/test`: integration/unit tests

### Frontend

- `Frontend/src/pages`: Landing, Products, ProductDetail, Login, Register, Checkout, SellerProducts, CreateProduct...
- `Frontend/src/components`: Header, Footer, ProductSection, CartDrawer...
- `Frontend/src/services`: `apiClient`, `authService`, `productService`, `cartService`, `categoryService`, `sessionService`
- `Frontend/src/context/CartContext.jsx`: state gio hang
- `Frontend/src/App.jsx`, `Frontend/src/main.jsx`: app shell + routing bootstrap

---

## 3) Chuc nang hien co (suy ra tu cau truc)

1. Xac thuc nguoi dung:
   - Dang ky, dang nhap, refresh token, logout
2. Danh muc/san pham:
   - Xem danh sach san pham, chi tiet san pham
   - CRUD san pham (co ve cho seller/admin)
3. Gio hang:
   - Them/sua/xoa item trong cart
4. Don hang:
   - Checkout, quan ly trang thai don
5. Admin:
   - Cac endpoint quan tri (phan quyen, quan ly)

---

## 4) Kien truc tong quat

### Backend architecture

- Controller -> Service -> Repository -> DB
- DTO cho request/response
- Global exception handler
- Security dua tren JWT + Spring Security
- Co kha nang upload anh (Cloudinary)

### Frontend architecture

- React pages + reusable components
- Service layer tach rieng call API
- Context dung cho cart/global state can thiet
- Vite cho build/dev server

---

## 5) Gia dinh ky thuat quan trong

- Backend da co he thong auth JWT, can dong bo frontend token handling.
- API contracts can duoc chot ro rang (request/response/status code).
- Frontend can uu tien dung service layer thay vi call truc tiep.
- Chua xac nhan day du ve test coverage va e2e flow thanh toan.

---

## 6) Pham vi uu tien de trien khai tiep

De xay dung web ban hang on dinh, de xuat uu tien theo thu tu:

1. **Core flow mua hang**
   - Products -> Product Detail -> Add to Cart -> Checkout -> Order Success

2. **Auth + session**
   - Dang nhap/dang ky
   - Luu/refresh token
   - Bao ve route can dang nhap

3. **Seller flow**
   - CRUD san pham (tao/sua/xoa/xem list)
   - Upload hinh

4. **Quality**
   - Xu ly loi thong nhat (toast/UI states)
   - Loading/empty/error states
   - Test cho flow quan trong

---

## 7) Rui ro va diem can lam ro

- Mapping chinh xac endpoint backend <-> frontend service
- Cau hinh CORS va baseURL giua 2 app
- Chuan hoa status enum/order lifecycle
- Quyen truy cap (buyer/seller/admin)
- Dong bo field schema (gia, ton kho, trang thai)

---

## 8) Dinh huong tai lieu tiep theo

- `docs/spec.md`: dac ta chuc nang chi tiet (functional + API + acceptance criteria)
- Bo sung sequence flow cho checkout va auth refresh token
- Bo sung danh sach backlog theo sprint nho
