# My Orders — User Order Management

Trang quản lý đơn hàng cho người mua (Buyer) với 4 tab trạng thái, tìm kiếm, chi tiết đơn và hủy đơn.

## Tính năng

- **4 tab trạng thái**: Chờ xác nhận, Đang giao, Giao hàng thành công, Đã hủy
- **Danh sách đơn hàng**: Hiển thị mã đơn, ngày đặt, tổng tiền, trạng thái, địa chỉ, điện thoại
- **Drawer chi tiết nhanh**: Xem sản phẩm, phí vận chuyển, giảm giá, timeline trạng thái
- **Trang chi tiết đầy đủ**: Timeline, thông tin giao hàng, thanh toán, tracking
- **Tìm kiếm**: Theo mã đơn, số điện thoại, địa chỉ (debounce 300ms)
- **Phân trang**: 8 đơn/trang
- **Hủy đơn**: Chỉ hiển thị khi trạng thái cho phép (PENDING, CONFIRMED, PREPARING)
- **Responsive**: Desktop (list + panel), Mobile (list + modal overlay)
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigable, focus visible

## Mapping trạng thái (Backend → UI)

| Backend Status | UI Tab               |
| -------------- | -------------------- |
| PENDING        | Chờ xác nhận         |
| CONFIRMED      | Chờ xác nhận         |
| PREPARING      | Đang giao            |
| SHIPPING       | Đang giao            |
| DELIVERED      | Giao hàng thành công |
| CANCELLED      | Đã hủy               |

Theo spec tại `docs/spec.md` (section 4.4) và `docs/ADMIN_API_TEST_GUIDE.md` (Valid status transitions).

## API Endpoints sử dụng

| Method | Endpoint                   | Mô tả                        |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/orders/my`               | Danh sách đơn hàng của buyer |
| GET    | `/orders/{orderId}`        | Chi tiết một đơn hàng        |
| POST   | `/orders/{orderId}/cancel` | Hủy đơn hàng (buyer)         |

## Cấu trúc file

```
Frontend/src/
├── pages/
│   ├── MyOrdersPage.jsx       # Trang chính: tabs, search, list, drawer
│   ├── MyOrdersPage.css       # Toàn bộ styles cho orders
│   └── OrderDetailPage.jsx    # Trang chi tiết đầy đủ
├── services/
│   ├── orderService.js        # API client + status mapping helpers
│   └── __tests__/
│       └── orderService.test.js  # Unit tests status mapping
└── App.jsx                    # Routes: /orders, /orders/:orderId

Backend/src/main/java/com/duybao/SplitGo/
├── Controller/
│   └── OrderController.java   # Thêm GET /orders/{id}, POST /orders/{id}/cancel
├── Service/
│   ├── OrderService.java      # Thêm getOrderById, cancelOrder
│   └── Impl/
│       └── OrderServiceImpl.java  # Implement + toOrderResponse đầy đủ fields
├── DTO/Response/ecommerce/
│   ├── OrderResponse.java     # Thêm orderCode, phone, discountAmount, shippingFee, etc.
│   └── OrderItemResponse.java # Thêm productImageUrl
└── Model/
    └── Order.java             # Thêm recipientName
```

## Biến môi trường

| Variable        | Default                 | Mô tả                |
| --------------- | ----------------------- | -------------------- |
| `VITE_API_BASE` | `http://localhost:8080` | Backend API base URL |

## Cách chạy

```bash
# Backend (Spring Boot)
cd Backend
./mvnw spring-boot:run

# Frontend (React + Vite)
cd Frontend
npm install
npm run dev
```

## Chạy tests

```bash
cd Frontend
npx vitest run src/services/__tests__/orderService.test.js
```

## Tài liệu tham khảo

- `docs/spec.md` — Functional spec (section 4.4: Checkout & Order)
- `docs/context.md` — Project context & architecture
- `docs/erd-diagram.md` — Database schema
- `docs/ADMIN_API_TEST_GUIDE.md` — API contracts & status transitions (section Orders)
- `docs/ADMIN_DASHBOARD_README.md` — Admin dashboard overview
