# Seller Products Page - Cập nhật UI (May 2026)

## Tổng quan thay đổi

Cập nhật toàn diện trang **"Sản phẩm đã tạo"** (`Frontend/src/pages/SellerProductsPage.jsx`) và form **"Tạo sản phẩm"** (`Frontend/src/pages/CreateProductPage.jsx`) để hiển thị và chỉnh sửa đầy đủ tất cả fields của entity `Product`.

## Files đã thay đổi

| File                                        | Thay đổi                                                                                                                                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Frontend/src/pages/SellerProductsPage.jsx` | Rewrite toàn bộ: hiển thị đầy đủ fields, inline-edit mở rộng (gồm options & variants), filter/sort mới, bulk actions, image preview lightbox, toggle visibility, **xem như người mua**, **hiển thị reviews** |
| `Frontend/src/pages/CreateProductPage.jsx`  | Thêm fields: salePrice, weight, sku, isFeatured vào form tạo sản phẩm                                                                                                                                        |
| `Frontend/src/pages/ProductDetailPage.jsx`  | Thêm `sellerView` mode: khi truy cập với `?sellerView=1`, ẩn nút mua + số lượng, hiển thị banner "đang xem với tư cách người bán"                                                                            |

## Backend compatibility

- `UpdateProductRequest.java` đã hỗ trợ: `salePrice`, `weight`, `sku`, `isFeatured` → PUT `/products/{id}` hoạt động đầy đủ
- `productService.updateSellerProduct` gửi JSON body với tất cả fields mới
- `productService.createProductWithImage` đã hỗ trợ FormData với các fields mới

---

## Acceptance Criteria

### AC1: Hiển thị đầy đủ fields

- [x] Mỗi product card hiển thị: name, description (rút gọn), price (VND), salePrice + discount badge, stock + low stock badge, soldCount, viewCount, sku, weight, ID, category, status (human-friendly)
- [x] Badge "Nổi bật" hiển thị khi `isFeatured === true`
- [x] Badge "-X% giảm" hiển thị khi `salePrice < price`
- [x] Badge "Sắp hết hàng" hiển thị khi `stock > 0 && stock <= 10`
- [x] Trạng thái hiển thị dạng "Đang hiển thị" / "Đã ẩn" với màu tương ứng
- [x] Collapsible section: slug (có copy button), createdAt, updatedAt

### AC2: Inline Edit đầy đủ

- [x] Click "Cập nhật" mở form prefilled với tất cả fields: name, description, price, salePrice, stock, weight, sku, status, categoryId, isFeatured
- [x] Khi nhập salePrice < price → hiển thị realtime discount % (VD: "Giảm 20% so với giá gốc")
- [x] Khi salePrice >= price → cảnh báo "Giá khuyến mại phải nhỏ hơn giá gốc"
- [x] Validation client-side: price > 0, stock >= 0, salePrice <= price, weight >= 0
- [x] Lưu thành công → toast success, card cập nhật

### AC3: Image Preview & Upload

- [x] Click ảnh → mở lightbox xem ảnh full-size
- [x] Chọn file ảnh → hiển thị preview thumbnail + tên file + kích thước
- [x] Click "Lưu ảnh" → gọi `PUT /products/{id}/image`, cập nhật ảnh trên card, toast success
- [x] Hover ảnh → hiệu ứng zoom nhẹ + overlay "Xem ảnh"

### AC4: Toggle Visibility

- [x] Nút "Tạm ẩn" / "Hiển thị" với confirm 2 bước: click → hiện "Xác nhận? Có / Không"
- [x] Xác nhận → gọi `PUT /products/{id}` với `{ status: newStatus }`
- [x] Badge trạng thái + style card cập nhật ngay

### AC5: Filter & Sort mới

- [x] Search theo tên, SKU, slug
- [x] Filter: Danh mục, Số lượng (Còn hàng/Hết hàng/Sắp hết), Trạng thái hiển thị, Nổi bật, Khuyến mại
- [x] Sort: Mới nhất/Cũ nhất/Bán chạy nhất/Xem nhiều nhất
- [x] Price range (Giá từ / Giá đến)

### AC6: Bulk Actions

- [x] Checkbox per product + "Chọn tất cả"
- [x] Khi có sản phẩm được chọn → hiện bulk action bar
- [x] Bulk actions: Ẩn tất cả, Hiển thị tất cả, Đánh dấu nổi bật, Bỏ nổi bật
- [x] Toast kết quả: "Đã [action] X sản phẩm[, Y thất bại]"

### AC7: Responsive & Accessibility

- [x] Mobile: layout flex-col, ảnh full-width
- [x] Tất cả nút có `aria-label`
- [x] Input có label gắn với `htmlFor`
- [x] Disabled state rõ ràng với `disabled:cursor-not-allowed disabled:opacity-70`
- [x] Spinner hiển thị khi saving

---

## Test Cases

### TC1: Hiển thị sale price + discount badge

**Steps:**

1. Tạo sản phẩm với price=250000, salePrice=199000
2. Vào trang Seller Products
   **Expected:**

- Hiển thị cả "Giá: 250.000 ₫" và "Giá KM: 199.000 ₫"
- Badge "-20% giảm" màu rose
- Card không có lỗi hiển thị

### TC2: Validation client-side - giá âm

**Steps:**

1. Click "Cập nhật" sản phẩm
2. Nhập price = -100
3. Click "Lưu cập nhật"
   **Expected:**

- Toast error: "Giá sản phẩm phải > 0"
- Không gọi API
- Form vẫn mở, không bị đóng

### TC3: Upload ảnh và lưu

**Steps:**

1. Click "Sửa ảnh" → chọn file ảnh
2. Xác nhận preview hiển thị đúng
3. Click "Lưu ảnh"
   **Expected:**

- Toast success: "Cập nhật ảnh sản phẩm thành công"
- Ảnh trên card cập nhật
- Preview thumbnail biến mất sau khi lưu

### TC4: Toggle visibility ACTIVE ↔ INACTIVE

**Steps:**

1. Sản phẩm đang ACTIVE → click "Tạm ẩn"
2. Hiện confirm: "Xác nhận? Có / Không"
3. Click "Có"
   **Expected:**

- Badge chuyển sang "Đã ẩn" (amber)
- Card có border amber-300, bg amber-50/40
- Nút chuyển thành "Hiển thị" (màu emerald)
- Toast: "Đã ẩn sản phẩm"

### TC5: Filter "Nổi bật"

**Steps:**

1. Có 5 sản phẩm, 2 sản phẩm isFeatured=true
2. Chọn filter "Nổi bật" → "Nổi bật"
   **Expected:**

- Chỉ hiển thị 2 sản phẩm có isFeatured=true
- Badge "Nổi bật" hiển thị trên cả 2 card

### TC6: Bulk hide

**Steps:**

1. Chọn 3 sản phẩm đang ACTIVE qua checkbox
2. Chọn "Ẩn tất cả" trong bulk action
3. Click "Thực hiện"
   **Expected:**

- Cả 3 sản phẩm chuyển sang INACTIVE
- Badge + style card cập nhật
- Toast: "Đã ẩn 3 sản phẩm"
- Checkbox cleared

### TC7: Copy slug

**Steps:**

1. Expand "Xem thêm" trên sản phẩm có slug
2. Click icon copy cạnh slug
   **Expected:**

- Toast: "Đã sao chép đường dẫn"
- Slug được copy vào clipboard

### TC8: Search theo SKU

**Steps:**

1. Nhập SKU của sản phẩm vào ô tìm kiếm
   **Expected:**

- Chỉ hiển thị sản phẩm có SKU khớp
- Các sản phẩm khác bị ẩn

### TC9: Sort theo bán chạy nhất

**Steps:**

1. Chọn "Bán chạy nhất" trong dropdown sắp xếp
   **Expected:**

- Sản phẩm hiển thị theo thứ tự soldCount giảm dần

### TC10: Image lightbox

**Steps:**

1. Click vào ảnh sản phẩm
   **Expected:**

- Ảnh hiển thị full-size trong lightbox với backdrop mờ
- Click bên ngoài hoặc nút X → đóng lightbox

### TC11: Edit options & variants

**Steps:**

1. Click "Cập nhật" sản phẩm có variants
2. Thay đổi giá của một variant
3. Click "Lưu cập nhật"
   **Expected:**

- Options và variants được load đúng vào form
- Có thể sửa/thêm/xóa options và variants
- Lưu thành công, toast hiển thị

### TC12: Xem như người mua

**Steps:**

1. Click "Xem như người mua" trên sản phẩm
   **Expected:**

- Mở tab mới với URL `/products/{id}?sellerView=1`
- Trang detail hiển thị banner "Bạn đang xem với tư cách người bán"
- Nút "Thêm vào giỏ hàng" và quantity selector bị ẩn
- Có nút "Quay lại quản lý sản phẩm"

### TC13: Xem reviews

**Steps:**

1. Click tab "Đánh giá" trên sản phẩm đã có reviews
   **Expected:**

- Load danh sách reviews từ API `/reviews/product/{id}/approved`
- Hiển thị: avatar, tên, sao, ngày, title, comment, phân loại
- Nếu chưa có review: hiển thị "Chưa có đánh giá nào"

---

## Cách test

```bash
# 1. Chạy backend
cd Backend
./mvnw spring-boot:run

# 2. Chạy frontend
cd Frontend
npm run dev

# 3. Đăng nhập với tài khoản seller
# 4. Vào /seller/products
# 5. Thực hiện các test case trên
```

## Ghi chú kỹ thuật

- **Discount percent**: `Math.round(((price - salePrice) / price) * 100)`
- **Status label**: `"ACTIVE" → "Đang hiển thị"`, `"INACTIVE" → "Đã ẩn"`
- **Format tiền**: `Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })`
- **Image preview**: `URL.createObjectURL(file)` cho preview, cleanup tự động
- **Bulk actions**: Gọi tuần tự, không song song để tránh rate limiting
- **Seller view**: Query param `?sellerView=1` → `useSearchParams` check → ẩn buy button
- **Reviews API**: `getProductReviews(productId)` → `GET /reviews/product/{id}/approved`
- **Options & Variants edit**: Tái sử dụng pattern từ `CreateProductPage.jsx` (options → generate combinations → edit variants)
