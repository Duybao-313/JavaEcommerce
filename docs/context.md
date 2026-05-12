# Project Context - JavaEcommerce (SplitGo)

## 1) Tong quan du an

Du an la he thong web ban hang gom 2 phan:

- **Backend**: Spring Boot (Java), da mo rong domain theo huong multi-seller, bo sung review/wishlist/shipping va cap nhat schema cho user/product/category/order.
- **Frontend**: React + Vite, da co cac trang core cho ecommerce flow (products, cart, checkout, seller pages, auth).

Trang thai hien tai: da chuyen tu giai doan "dinh nghia context" sang "cap nhat implementation", trong do backend da co them nhieu API va DTO moi.

---

## 2) Cau truc thu muc chinh

### Backend

- `Backend/src/main/java/com/duybao/SplitGo/Config`: cau hinh bao mat, JWT, cloudinary, khoi tao du lieu.
- `Backend/src/main/java/com/duybao/SplitGo/Controller`: Authentication, Product, Category, Cart, Order, Admin, **Review, Wishlist, Shipping**.
- `Backend/src/main/java/com/duybao/SplitGo/Service` + `Service/Impl`: business logic cho module cu va module moi.
- `Backend/src/main/java/com/duybao/SplitGo/Repository`: JPA repositories (bao gom **ReviewRepository, WishlistRepository, ShippingRepository, ProductVariantRepository**).
- `Backend/src/main/java/com/duybao/SplitGo/Model`: entities chinh (User, Product, Category, Cart, Order, PaymentTransaction, **Review, Wishlist, Shipping, ProductVariant**).
- `Backend/src/main/java/com/duybao/SplitGo/Enum`: enum mo rong them **SellerVerificationStatus, StoreStatus, AddressType, ShippingStatus**.
- `Backend/src/main/java/com/duybao/SplitGo/DTO`: request/response models; da cap nhat them field moi cho product/category/checkout/user + DTO cho review/wishlist/shipping.
- `Backend/src/main/resources/application.yaml`: cau hinh app.
- `Backend/src/test`: integration/unit tests.

Ghi chu: hien tai co `CreateAddressRequest` va `UpdateAddressRequest`, nhung chua co `Address` entity/controller/service/repository trong source.

### Frontend

- `Frontend/src/pages`: Landing, Products, ProductDetail, Login, Register, Checkout, SellerProducts, **CreateProduct (da redesign: 2-step — dinh nghia options truoc, generate variants sau)**...
- `Frontend/src/components`: Header, Footer, ProductSection, CartDrawer, **review/** (ReviewFlow, ProductReviewCard, ReviewChoiceModal, ReviewUploadZone)...
- `Frontend/src/services`: `apiClient`, `authService`, `productService`, `cartService`, `categoryService`, `sessionService`, **`reviewService`**, **`orderService`**
- `Frontend/src/context/CartContext.jsx`: state gio hang
- `Frontend/src/App.jsx`, `Frontend/src/main.jsx`: app shell + routing bootstrap

---

## 3) Chuc nang hien co (cap nhat theo code)

1. Xac thuc nguoi dung:
   - Dang ky, dang nhap, refresh token, logout

2. Danh muc/san pham:
   - Xem danh sach san pham, chi tiet san pham
   - CRUD san pham theo role seller/admin
   - Product da ho tro them field `salePrice`, `weight`, `sku`, `isFeatured`, `slug`
   - **Product Variant**: ho tro nhieu variant (size, color) voi gia/stock/image rieng
     - Entity `ProductVariant` + `JsonMapConverter` cho attributes JSON
     - API `GET /products/{id}/variants`
     - Variant selector tren ProductDetailPage + CartDrawer
     - **Product Options (moi)**: seller dinh nghia option types (vd color, size) truoc, sau do he thong tu dong generate variant combinations tu cac option values. DTO: `ProductOptionRequest` / `ProductOptionResponse`. Validation server-side (`validateOptionsAndVariants`) dam bao moi variant co du cac option key va value hop le.
     - `ProductResponse` tra ve ca `options` (derived tu variant attributes) va `variants`.

3. Gio hang + thanh toan:
   - Them/sua/xoa item trong cart
   - **Cart ho tro variantId**: moi variant cua cung product la cart item rieng
   - Checkout request da ho tro `paymentMethod` va `note`

4. Don hang:
   - Quan ly order status
   - Order da co them field financial/tracking: `orderCode`, `discountAmount`, `shippingFee`, `finalAmount`, `shippedAt`, `deliveredAt`, `seller`

5. Tinh nang moi:
   - **Review API** (`/reviews`): tao, lay danh sach, xoa. Review hien thi ngay, khong can duyet. Ho tro variant-level review.
   - **Review Flow sau mua hang**: user xac nhan da nhan hang → modal chon "Danh gia ngay" / "De sau" → form danh gia per item (star 1-5, title, comment, upload anh) → badge "Da danh gia" tren item da review.
   - **Wishlist API** (`/wishlist`): add/remove/list/check
   - **Shipping API** (`/shippings`): tao/cap nhat/track/mark-delivered/mark-in-transit

---

## 4) Kien truc tong quat

### Backend architecture

- Controller -> Service -> Repository -> DB
- DTO request/response cho tung module
- Global exception handler + error code theo domain
- Security dua tren JWT + Spring Security + role-based authorization
- Ho tro upload anh (Cloudinary)

### Domain updates quan trong

- `User`: bo sung seller profile fields (`storeName`, `storeLogo`, `storeBanner`, `storeAddress`, `bankAccount`, `bankName`, `sellerVerified`, `storeRating`, `totalSales`, `storeStatus`) + verification flags (`emailVerified`, `phoneVerified`, `isActive`).
- `Category`: ho tro parent-child hierarchy, `slug`, `imageUrl`, `sortOrder`, `isActive`.
- `Product`: bo sung truong khuyen mai/hien thi (`salePrice`, `weight`, `sku`, `isFeatured`, `slug`).
  - **ProductVariant**: entity moi luu bien the (size, color...) voi sku, attributes (JSON), price, salePrice, stock, imageUrl, weight, @Version.
  - CartItem/OrderItem: bo sung `variantId`, `variantAttributes`. Stock decrement an toan qua conditional UPDATE + optimistic locking.
- `Order`: bo sung multi-seller + shipping/payment tracking fields.
- New entities: `Review`, `Wishlist`, `Shipping`, **`ProductVariant`**; co lien ket voi `User`, `Product`, `Order`.
  - `Review`: bo sung `variantId` (FK ProductVariant) de ho tro review theo variant cu the. `OrderItemResponse` bo sung `variantId`, `reviewed`, `canReview`.
- New DTOs: `ProductVariantRequest`, `ProductVariantResponse`, `ProductOptionRequest`, `ProductOptionResponse`, `ReviewableItemResponse`, update `CreateProductRequest`, `UpdateProductRequest`, `ProductResponse`, `AddCartItemRequest`, `CartItemResponse`, `CreateReviewRequest` (them `variantId`).

### Frontend architecture

- React pages + reusable components
- Service layer tach rieng call API
- Context cho cart/global state can thiet
- Vite cho build/dev server

---

## 5) Gia dinh ky thuat quan trong

- Backend da co auth JWT; frontend can tiep tuc dong bo token lifecycle va route guard.
- API contracts dang duoc mo rong; can chot format request/response/status code trong `docs/spec.md`.
- Enum lifecycle can dong bo xuyen suot DB <-> backend <-> frontend (`OrderStatus`, `ProductStatus`, `ShippingStatus`, `SellerVerificationStatus`, `StoreStatus`).
- Da co cac DTO address va enum `AddressType`, nhung module Address chua duoc wiring day du trong backend.
- Test coverage va e2e flow checkout/chuyen trang thai shipping chua duoc xac nhan day du.

---

## 6) Pham vi uu tien de trien khai tiep

1. **Hoan thien Order flow voi variant**
   - Dong bo checkout de decrement variant stock an toan
   - OrderItem luu variantAttributes de hien thi don hang

2. **Hoan thien module Address**
   - Tao `Address` entity + repository/service/controller
   - Noi ket voi checkout flow

3. **Quality**
   - Them test cho critical flow: checkout voi variant, concurrent order (variant stock safety)
   - Chuan hoa empty/loading/error states o UI

---

## 7) Rui ro va diem can lam ro

- Mapping endpoint backend <-> frontend service cho module moi (reviews/wishlist/shippings)
- CORS va baseURL giua 2 app
- Dong bo enum va order lifecycle theo nghiep vu
- Quyen truy cap (buyer/seller/admin) va ownership checks
- Dong bo migration DB voi model hien tai (ddl-auto: update)
- Khoang trong module Address (DTO da co, layer runtime chua co)
- **Variant stock safety**: can test concurrent order de dam bao optimistic locking + conditional UPDATE hoat dong dung
- **Checkout voi variant**: can dong bo OrderServiceImpl de decrement variant stock thay vi product stock
- **Review voi variant**: dam bao duplicate check per product+variant (khong chi per order)

---

## 8) Dinh huong tai lieu tiep theo

- `docs/spec.md`: cap nhat API contract cho product variant, reviews/wishlist/shippings va field moi.
- `docs/IMPLEMENTATION_SUMMARY.md`: theo doi tien do implementation theo phase.
- `docs/QUICK_CHECKLIST.md`: checklist migration + API test + deployment readiness.
- Bo sung sequence flow cho checkout + variant stock decrement + shipping tracking + review moderation.
