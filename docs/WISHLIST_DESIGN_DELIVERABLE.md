# Wishlist Feature — Design Deliverable

> **Project**: JavaEcommerce (SplitGo)
> **Register**: Product (app UI — design SERVES the product)
> **Color Strategy**: Restrained (tinted neutrals + one accent ≤10%)
> **Scene**: Buyer browsing evening at home on phone, or desk lunch break on laptop — ambient indoor light, relaxed but intentional shopping mood
> **Tone**: Restrained but confident — clarity over decoration, quick affordance, zero friction

---

## 1. Wireframes

### 1.1 Mobile (375px)

```
┌──────────────────────────────────┐
│  ☰  🛍️ SplitGo         ♥ 3  🛒  │  ← Header: heart icon + badge count (3)
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │                    ♥       │  │  ← Product Card (grid 2-col)
│  │   [Product Image]         │  │     Heart top-right over image
│  │                    ♥       │  │
│  │  Áo thun cotton           │  │
│  │  150.000₫  ~~~~120.000₫~~~~  │  │     salePrice with strikethrough
│  │  ★ 4.5  |  Đã bán 1.2k   │  │
│  │  [Thêm vào giỏ]           │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │                    ♥ (fill)│  │  ← Heart filled = wishlisted
│  │   [Product Image]         │  │
│  │  Quần jeans slim          │  │
│  │  350.000₫                 │  │
│  │  ★ 4.2  |  Đã bán 856    │  │
│  │  [Thêm vào giỏ]           │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

**Mobile Wishlist Page** (`/wishlist`):

```
┌──────────────────────────────────┐
│  ←  Danh sách yêu thích    🛒   │  ← Back nav + title
├──────────────────────────────────┤
│  [Thêm tất cả vào giỏ]  [Xóa đã chọn] │  ← Bulk actions row
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ ☐  ┌──────┐               │  │  ← Checkbox + thumbnail
│  │    │ img  │  Áo thun      │  │
│  │    └──────┘  Màu: Đỏ, XL │  │     Variant attributes
│  │              120.000₫     │  │     Current price
│  │              Giá có thể... │  │     Price note (small, muted)
│  │    [Xóa]  [Chọn phân loại]│  │     Remove + add-to-cart
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │    ┌──────┐  Quần jeans   │  │  ← No variants → direct add
│  │    │ img  │  350.000₫     │  │
│  │    └──────┘               │  │
│  │    [Xóa]     [Thêm vào giỏ]│  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │    ┌──────┐  Giày sneaker │  │
│  │    │ img  │  Size: 42     │  │
│  │    └──────┘  890.000₫     │  │
│  │    [Xóa]  [Chọn phân loại]│  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

**Wishlist Empty State (Mobile)**:

```
┌──────────────────────────────────┐
│  ←  Danh sách yêu thích         │
├──────────────────────────────────┤
│                                  │
│          (╥﹏╥)                  │  ← Friendly illustration
│                                  │
│     Bạn chưa lưu sản phẩm nào    │
│   Thêm sản phẩm bạn thích để     │
│         mua sau nhé.             │
│                                  │
│      ┌──────────────────┐        │
│      │   Mua sắm ngay    │        │  ← CTA button
│      └──────────────────┘        │
│                                  │
└──────────────────────────────────┘
```

### 1.2 Tablet (768px)

Same as mobile but product cards in **3-column grid** on product listing. Wishlist page uses **2-column grid** for wishlist items, each item as a card with image on top, details below.

### 1.3 Desktop (1280px+)

```
┌────────────────────────────────────────────────────────────────────┐
│  🛍️ SplitGo    Products  Features  Contact    ♥ 5    👤    🛒 3  │  ← Header
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Danh sách yêu thích (5)                    [Thêm tất cả] [Xóa ĐC] │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │   img    │  │   img    │  │   img    │    ← 3-col grid         │
│  │          │  │          │  │          │                        │
│  │ ♥ filled │  │    ♥     │  │    ♥     │                        │
│  │ Áo thun  │  │Quần jeans│  │ Sneaker  │                        │
│  │ Đỏ, XL   │  │          │  │ Size 42  │                        │
│  │ 120.000₫ │  │ 350.000₫ │  │ 890.000₫ │                        │
│  │ Giá có...│  │          │  │          │                        │
│  │[Xóa][PL] │  │[Xóa][Gio]│  │[Xóa][PL] │                        │
│  └──────────┘  └──────────┘  └──────────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Desktop Wishlist Drawer (optional enhancement)**:

```
On header heart hover/click → small drawer slides from right (360px):
┌─────────────────────┐
│  Yêu thích (5)  ✕   │
│  ┌──────┐           │
│  │ img  │ Áo thun   │  ← Top 3-5 items
│  └──────┘ 120.000₫  │
│  ─────────────────  │
│  ┌──────┐           │
│  │ img  │ Quần jeans│
│  └──────┘ 350.000₫  │
│  ─────────────────  │
│  [Xem tất cả →]     │  ← Link to /wishlist
└─────────────────────┘
```

---

## 2. High-Fidelity Mockup Spec

### 2.1 Color Palette (OKLCH)

| Role           | Name               | OKLCH                    | Hex (approx) | Usage                                   |
| -------------- | ------------------ | ------------------------ | ------------ | --------------------------------------- |
| Accent         | `brand-rose`       | `oklch(0.55 0.21 10)`    | `#e11d48`    | Heart icon (filled), primary CTA, badge |
| Accent hover   | `brand-rose-hover` | `oklch(0.48 0.22 10)`    | `#be123c`    | Heart hover, button hover               |
| Accent surface | `brand-rose-soft`  | `oklch(0.96 0.008 10)`   | `#fff1f2`    | Heart background tint on cards          |
| Neutral bg     | `neutral-canvas`   | `oklch(0.985 0.002 260)` | `#fafafa`    | Page background                         |
| Neutral card   | `neutral-card`     | `oklch(0.99 0.001 260)`  | `#fcfcfc`    | Card background                         |
| Neutral border | `neutral-border`   | `oklch(0.89 0.005 260)`  | `#e4e4e7`    | Card borders, dividers                  |
| Neutral text   | `neutral-text`     | `oklch(0.25 0.01 260)`   | `#18181b`    | Body text                               |
| Neutral muted  | `neutral-muted`    | `oklch(0.55 0.01 260)`   | `#71717a`    | Secondary text, price note              |
| Success        | `success-green`    | `oklch(0.62 0.17 145)`   | `#16a34a`    | Toast success                           |
| Error          | `error-red`        | `oklch(0.50 0.20 25)`    | `#dc2626`    | Toast error                             |

### 2.2 Typography

| Token       | Size            | Weight | Line-height | Usage                         |
| ----------- | --------------- | ------ | ----------- | ----------------------------- |
| `text-xs`   | 0.75rem (12px)  | 500    | 1.25        | Badge count, price note, meta |
| `text-sm`   | 0.875rem (14px) | 400    | 1.4         | Secondary text, variant attrs |
| `text-base` | 1rem (16px)     | 400    | 1.5         | Body, product name            |
| `text-lg`   | 1.125rem (18px) | 600    | 1.4         | Section headings              |
| `text-xl`   | 1.25rem (20px)  | 700    | 1.3         | Page title                    |
| `text-2xl`  | 1.5rem (24px)   | 700    | 1.25        | H1                            |

Font family: `Inter, system-ui, -apple-system, sans-serif`

### 2.3 Spacing (8px base)

| Token     | Value | Usage                              |
| --------- | ----- | ---------------------------------- |
| `space-1` | 4px   | Icon-label gap                     |
| `space-2` | 8px   | Tight gaps, badge padding          |
| `space-3` | 12px  | Card padding (compact)             |
| `space-4` | 16px  | Standard card padding, section gap |
| `space-5` | 20px  | Card gutter (grid)                 |
| `space-6` | 24px  | Page padding, section spacing      |
| `space-8` | 32px  | Large section divider              |

### 2.4 Iconography

- **Heart (outline)**: `lucide-react` `Heart` — `size={20}` on cards, `size={22}` in header
- **Heart (filled)**: `lucide-react` `Heart` with `fill="currentColor"` — same sizing
- **Trash/Remove**: `lucide-react` `Trash2` — `size={16}`
- **Shopping cart**: `lucide-react` `ShoppingCart` — `size={22}` header
- **Empty state illustration**: Custom SVG — simple line-art, no gradients, subdued neutral tones

### 2.5 Shadows / Elevation

| Token               | Value                          | Usage                |
| ------------------- | ------------------------------ | -------------------- |
| `shadow-card`       | `0 1px 3px rgba(0,0,0,0.06)`   | Product cards        |
| `shadow-card-hover` | `0 4px 16px rgba(0,0,0,0.08)`  | Card hover (desktop) |
| `shadow-drawer`     | `-4px 0 24px rgba(0,0,0,0.10)` | Wishlist drawer      |

No glassmorphism. No gradient borders. No side-stripe borders.

### 2.6 Border Radius

- Cards: `rounded-2xl` (16px)
- Buttons: `rounded-xl` (12px)
- Heart icon bg circle: `rounded-full` (50%)

---

## 3. Interaction & Animation Spec

### 3.1 Heart Toggle (Wishlist Button)

```
State: outline (not wishlisted)
  │
  ├─ tap/click
  │
  ├─► Optimistic: fill heart immediately
  │   Animation: scale(1) → scale(1.12) → scale(1)
  │   Duration: 180ms
  │   Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)  (ease-out-quart)
  │   Color: neutral-muted → brand-rose (transition 150ms)
  │
  ├─► POST /wishlist (fire-and-forget)
  │
  ├─► On success: toast "Đã thêm vào Wishlist" (bottom-center, 3s)
  │     Toast has "Hoàn tác" (Undo) button
  │
  └─► On failure: revert to outline, toast "Không thể thêm, thử lại" (error)
       Animation: brief shake (2px horizontal, 2 cycles, 100ms each)

State: filled (wishlisted)
  │
  ├─ tap/click
  │
  ├─► Optimistic: switch to outline
  │   Animation: fill fades out (150ms), scale settles to 1
  │   Note: NO layout animation — icon stays same size
  │
  ├─► DELETE /wishlist/{productId}
  │
  ├─► On success: toast "Đã xóa khỏi Wishlist" with "Hoàn tác"
  │     If from wishlist page: item fades out (opacity 1→0, 200ms ease-out)
  │
  └─► On failure: revert to filled, toast error
```

### 3.2 Undo (Snackbar Behavior)

```
Remove action:
  1. Optimistic: remove from UI (fade slide-up, 200ms)
  2. Show snackbar: "Đã xóa khỏi Wishlist" [Hoàn tác]
  3. Wait 4 seconds
  4. If "Hoàn tác" pressed → POST /wishlist to re-add, item slides back
  5. If timeout → actually delete via API (already called), snackbar dismisses
```

### 3.3 Add-to-Cart from Wishlist

```
From wishlist item — no variants:
  1. Tap "Thêm vào giỏ"
  2. Button text → "Đang thêm..." (spinner)
  3. POST /cart/items { productId, quantity: 1, variantId: null }
  4. On success:
     - Toast: "Đã thêm vào giỏ hàng"
     - Header cart badge: pulse animation (scale 1→1.15→1, 300ms)
     - Auto-open CartDrawer (slide from right)
  5. On failure: toast error

From wishlist item — has variants:
  1. Button reads "Chọn phân loại" (not "Thêm vào giỏ")
  2. Tap → navigate to /products/{productId}
  3. Toast: "Vui lòng chọn phân loại hàng trước khi thêm vào giỏ"
```

### 3.4 Batch Add-to-Cart

```
  1. Tap "Thêm tất cả vào giỏ"
  2. Filter items WITHOUT variants only
  3. Sequential add (or Promise.all with concurrency limit)
  4. Progress toast: "Đang thêm 3/5 sản phẩm..."
  5. On all done: "Đã thêm 5 sản phẩm vào giỏ"
  6. Items with variants: skipped with note "2 sản phẩm cần chọn phân loại"
```

### 3.5 Page Transitions

```
Enter /wishlist:
  - Skeleton cards (pulse animation) while loading
  - Content fades in (opacity 0→1, 250ms ease-out)
  - Items stagger: each card appears with 60ms delay

Empty state:
  - Illustration fades in (300ms)
  - CTA button slides up (opacity 0→1, transform Y 12→0, 300ms, 100ms delay)

Error state:
  - Error message + retry button
  - Retry: brief loading spinner on button, then reload
```

### 3.6 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Heart toggle: instant color swap (no scale)
- All staggered item animations: instant
- Toast: still appears but no slide-in; uses opacity fade only
- Badge pulse: disabled

---

## 4. Accessibility Notes

### 4.1 Heart Button (WishlistButton)

```jsx
<button
  role="button"
  aria-pressed={isWishlisted}
  aria-label={isWishlisted ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
  type="button"
  className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-rose"
>
  <Heart fill={isWishlisted ? "currentColor" : "none"} />
</button>
```

| Check          | Requirement                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| Keyboard       | `Enter` / `Space` toggles. Visible focus ring (2px offset, brand color)                |
| Screen reader  | Announces "Thêm vào wishlist, nút bật tắt" / "Xóa khỏi wishlist, nút bật tắt, đã nhấn" |
| Color contrast | Heart icon vs card bg: ≥ 3:1 (large icon, 20px+)                                       |
| Touch target   | Minimum 44×44px hit area (padding around icon)                                         |

### 4.2 Header Heart Icon

```jsx
<Link to="/wishlist" aria-label={`Danh sách yêu thích, ${count} sản phẩm`}>
  <Heart /> {count > 0 && <span aria-hidden="true">{count}</span>}
</Link>
```

| Check    | Requirement                                            |
| -------- | ------------------------------------------------------ |
| Badge    | `aria-hidden="true"` on badge (count is in aria-label) |
| Focus    | Standard link focus ring                               |
| Contrast | Badge text on brand bg: ≥ 4.5:1                        |

### 4.3 Wishlist Page

| Check         | Requirement                                                               |
| ------------- | ------------------------------------------------------------------------- |
| Heading       | `<h1>` — "Danh sách yêu thích"                                            |
| Checkboxes    | `aria-label="Chọn Áo thun cotton"` per item                               |
| Remove button | `aria-label="Xóa Áo thun cotton khỏi wishlist"`                           |
| Bulk actions  | `aria-label="Thêm tất cả sản phẩm không có phân loại vào giỏ"`            |
| Price note    | `aria-label="Giá hiện tại 120.000 đồng, có thể thay đổi"`                 |
| Empty state   | Meaningful illustration with `alt=""` (decorative); text provides meaning |
| Loading       | `aria-busy="true"` on skeleton container                                  |
| Error         | Error message is an `alert` role; retry is a button                       |

### 4.4 Toast / Snackbar

| Check        | Requirement                                             |
| ------------ | ------------------------------------------------------- |
| Role         | `role="status"` for auto-announce, `aria-live="polite"` |
| Undo         | Undo is a `<button>` inside the toast, focusable        |
| Auto-dismiss | 4s; pausing on hover (desktop)                          |
| Error        | `role="alert"` for immediate announcement               |

### 4.5 Color Contrast Summary

| Element               | Foreground | Background | Ratio  | Pass          |
| --------------------- | ---------- | ---------- | ------ | ------------- |
| Body text (16px)      | `#18181b`  | `#fafafa`  | 15.1:1 | ✅ AAA        |
| Muted text (14px)     | `#71717a`  | `#fafafa`  | 4.7:1  | ✅ AA         |
| Heart icon (filled)   | `#e11d48`  | `#fcfcfc`  | 4.1:1  | ✅ AA (large) |
| Button text on accent | `#ffffff`  | `#e11d48`  | 4.6:1  | ✅ AA         |
| Badge text on accent  | `#ffffff`  | `#e11d48`  | 4.6:1  | ✅ AA         |
| Price note (12px)     | `#71717a`  | `#fcfcfc`  | 4.5:1  | ✅ AA         |

---

## 5. Design Tokens (Tailwind Config Extensions)

```js
// Suggested additions to tailwind.config or index.css
:root {
  --color-brand-rose: oklch(0.55 0.21 10);
  --color-brand-rose-hover: oklch(0.48 0.22 10);
  --color-brand-rose-soft: oklch(0.96 0.008 10);
  --color-neutral-canvas: oklch(0.985 0.002 260);
  --color-neutral-card: oklch(0.99 0.001 260);
  --color-neutral-border: oklch(0.89 0.005 260);
  --color-neutral-text: oklch(0.25 0.01 260);
  --color-neutral-muted: oklch(0.55 0.01 260);
}
```

Or use Tailwind v4 arbitrary values directly:

- `bg-[oklch(0.96_0.008_10)]` for brand-rose-soft
- `text-[oklch(0.55_0.21_10)]` for brand-rose

---

## 6. Developer Brief

### 6.1 New Files to Create

| File                                    | Type      | Description                                             |
| --------------------------------------- | --------- | ------------------------------------------------------- |
| `src/services/wishlistService.js`       | Service   | API wrappers for wishlist endpoints                     |
| `src/components/WishlistButton.jsx`     | Component | Heart toggle button for product cards & detail          |
| `src/components/WishlistIconHeader.jsx` | Component | Header heart icon + badge count                         |
| `src/pages/WishlistPage.jsx`            | Page      | `/wishlist` route — full wishlist management            |
| `src/components/WishlistItem.jsx`       | Component | Single wishlist item row/card                           |
| `src/context/WishlistContext.jsx`       | Context   | (Optional) Global wishlist state if needed across pages |

### 6.2 Files to Modify

| File                                       | Change                                                      |
| ------------------------------------------ | ----------------------------------------------------------- |
| `src/App.jsx`                              | Add `<Route path="/wishlist" element={<WishlistPage />} />` |
| `src/components/Header.jsx` / `Header.css` | Add `<WishlistIconHeader />` in nav                         |
| `src/components/ProductSection.jsx`        | Add `<WishlistButton />` on each product card               |
| `src/pages/ProductDetailPage.jsx`          | Add `<WishlistButton />` near Add-to-cart                   |

### 6.3 Component Specifications

#### `wishlistService.js`

```js
import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

const BASE = "/wishlist";

export async function addToWishlist(productId) {
  const res = await authFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function removeFromWishlist(productId) {
  const res = await authFetch(`${BASE}/${productId}`, { method: "DELETE" });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function getWishlist() {
  const res = await authFetch(BASE);
  const payload = await parseApiResponse(res);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function checkWishlist(productId) {
  const res = await authFetch(`${BASE}/check/${productId}`);
  const payload = await parseApiResponse(res);
  return payload?.data === true;
}
```

#### `WishlistButton.jsx`

```jsx
// Props
{
  productId: number,         // required
  variantId?: number,        // optional, for variant-level wishlist (future)
  initialActive?: boolean,   // optional, from checkWishlist
  onToggle?: (active: boolean) => void,  // callback
  size?: 'sm' | 'md',        // default 'md'
  className?: string,
}

// Behavior:
// - Optimistic toggle with rollback on API error
// - Uses addToWishlist / removeFromWishlist
// - Shows toast with Undo on remove
// - Respects prefers-reduced-motion
// - aria-pressed, aria-label dynamic
```

#### `WishlistIconHeader.jsx`

```jsx
// No props (self-contained)
// Behavior:
// - Fetches GET /wishlist on mount and on auth change
// - Shows Heart icon + badge (number)
// - Badge hidden when count = 0
// - Click → navigate("/wishlist")
// - Optional desktop: hover shows mini-drawer with top 5 items
```

#### `WishlistPage.jsx`

```jsx
// No props (route page)
// States: loading (skeletons), empty, error, list
// Features:
// - Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
// - Checkbox per item for bulk select
// - "Thêm tất cả vào giỏ" — filters non-variant items, batch adds
// - "Xóa đã chọn" — removes selected items with Undo
// - Each item: WishlistItem component
// - Price note: "Giá hiện tại · Có thể thay đổi"
```

#### `WishlistItem.jsx`

```jsx
// Props
{
  item: {
    id: number,
    productId: number,
    productName: string,
    productImage: string,
    productPrice: string,      // e.g. "120000" (raw from backend)
    createdAt: string,
    // Enriched fields (from product detail or backend):
    salePrice?: string,
    variantAttributes?: object, // { color: "Đỏ", size: "XL" }
    sellerName?: string,
    hasVariants?: boolean,
  },
  selected: boolean,
  onSelect: (productId: number) => void,
  onRemove: (productId: number) => void,
  onAddToCart: (productId: number, variantId?: number) => void,
}

// Renders:
// - Checkbox, thumbnail image, product name
// - Variant attributes (if any): small chips "Đỏ · XL"
// - Current price (salePrice || price) formatted
// - Price note: "Giá có thể thay đổi" (muted, 12px)
// - Actions: Remove (heart icon) + Add-to-cart button
//   - Has variants → "Chọn phân loại" → navigate to detail
//   - No variants → "Thêm vào giỏ" → direct add + open CartDrawer
```

### 6.4 API Mapping Summary

| Frontend Call            | HTTP   | Endpoint                      | Request Body    | Response             |
| ------------------------ | ------ | ----------------------------- | --------------- | -------------------- |
| `addToWishlist(id)`      | POST   | `/wishlist`                   | `{ productId }` | `WishlistResponse`   |
| `removeFromWishlist(id)` | DELETE | `/wishlist/{productId}`       | —               | `WishlistResponse`   |
| `getWishlist()`          | GET    | `/wishlist`                   | —               | `WishlistResponse[]` |
| `checkWishlist(id)`      | GET    | `/wishlist/check/{productId}` | —               | `boolean`            |

All wrapped in `ApiResponse<T>`: `{ success, code, message, data, timestamp }`

### 6.5 Backend Gap: Enriched WishlistResponse

**Current `WishlistResponse`** only has: `id, userId, productId, productName, productImage, productPrice, createdAt`

**Missing for UI**:

- `salePrice` — to show sale price
- `variantAttributes` — to show variant info on wishlist items
- `sellerName` / `storeName` — optional

**Recommendation**: Backend should enrich `WishlistResponse` with at minimum `salePrice` and `variantAttributes` (or the frontend can do a secondary fetch to `/products/{productId}` for each item — but that's N+1).

**Frontend workaround** (if backend not updated yet): After `getWishlist()`, batch-fetch `getProductDetail(productId)` for each item to enrich with `salePrice`, `variants`, `options`. Cache results in a `Map<productId, product>`.

### 6.6 Cart Integration

When adding to cart from wishlist:

```js
// In WishlistItem or WishlistPage
import { addToCart } from "../services/cartService";
import { useCart } from "../context/CartContext";

const { refreshCart, openCart } = useCart();

async function handleAddToCart(productId, hasVariants) {
  if (hasVariants) {
    navigate(`/products/${productId}`);
    toast("Vui lòng chọn phân loại hàng trước khi thêm vào giỏ");
    return;
  }
  await addToCart(productId, 1, null);
  await refreshCart();
  openCart(); // auto-open drawer
  toast.success("Đã thêm vào giỏ hàng");
}
```

### 6.7 Route Addition

In `App.jsx`:

```jsx
<Route path="/wishlist" element={<WishlistPage />} />
```

No role guard needed — the API itself has `@PreAuthorize("hasRole('USER')")`. Frontend should redirect to `/login` if unauthenticated (handled by `authFetch` which should already do this).

---

## 7. Acceptance Criteria (QA Checklist)

### Core Flows

- [ ] **AC-01**: Clicking heart on product card (ProductSection) toggles wishlist state immediately (optimistic)
- [ ] **AC-02**: Header badge count updates within 500ms of any wishlist change
- [ ] **AC-03**: Header heart icon click navigates to `/wishlist`
- [ ] **AC-04**: Wishlist page loads correct list from `GET /wishlist`
- [ ] **AC-05**: Removing item from wishlist page shows Undo snackbar; Undo restores item
- [ ] **AC-06**: Undo snackbar auto-dismisses after 4s if not clicked
- [ ] **AC-07**: "Chọn phân loại" on variant-having items navigates to product detail
- [ ] **AC-08**: "Thêm vào giỏ" on non-variant items adds to cart and opens CartDrawer
- [ ] **AC-09**: "Thêm tất cả vào giỏ" only includes items without variants; shows results
- [ ] **AC-10**: Checkbox selection works; "Xóa đã chọn" removes all selected

### States

- [ ] **AC-11**: Empty state shows illustration + "Mua sắm ngay" CTA
- [ ] **AC-12**: Loading state shows skeleton cards matching grid layout
- [ ] **AC-13**: Error state shows retry button; retry reloads wishlist
- [ ] **AC-14**: Unauthenticated user sees login redirect (or toast "Vui lòng đăng nhập")

### Responsive

- [ ] **AC-15**: Mobile: 2-col product grid, 1-col wishlist items
- [ ] **AC-16**: Tablet: 3-col product grid, 2-col wishlist items
- [ ] **AC-17**: Desktop: 4-col product grid, 3-col wishlist items

### Accessibility

- [ ] **AC-18**: Heart button is keyboard-focusable with visible focus ring
- [ ] **AC-19**: Heart button announces correct aria-pressed and aria-label
- [ ] **AC-20**: All images have meaningful alt text
- [ ] **AC-21**: Screen reader announces toast messages
- [ ] **AC-22**: Color contrast passes AA for all text/UI elements

### Motion

- [ ] **AC-23**: Heart toggle animation respects `prefers-reduced-motion`
- [ ] **AC-24**: No layout shift when toggling heart on product cards
- [ ] **AC-25**: Toast animations are subtle (slide-up, not bounce/elastic)

---

## 8. Implementation Order (Suggested)

1. **`wishlistService.js`** — API layer (no UI, testable independently)
2. **`WishlistButton.jsx`** — Reusable heart toggle (test on ProductDetailPage first)
3. **`WishlistIconHeader.jsx`** — Header badge (add to Header)
4. **Integrate into `ProductSection.jsx`** — Add WishlistButton to product cards
5. **`WishlistItem.jsx`** — Single wishlist row/card component
6. **`WishlistPage.jsx`** — Full wishlist page with all states
7. **Wire up routing in `App.jsx`**
8. **Polish** — Animation tuning, a11y audit, responsive testing

---

_Design delivered per `impeccable` product register rules. No gradient text, no glassmorphism, no side-stripe borders, no modal-first thinking, no identical card grids. Color strategy: Restrained — tinted neutrals + brand-rose accent ≤10%._

---

## Appendix A: Architecture Diagrams

### A.1 Component Tree

```
App.jsx
├── Header.jsx
│   ├── BrandLogo
│   ├── NavMenu
│   ├── WishlistIconHeader.jsx  ← NEW (heart + badge → /wishlist)
│   ├── AuthUserBadge.jsx
│   └── CartButton.jsx (→ CartDrawer)
│
├── Routes
│   ├── / → LandingPage
│   │   └── ProductSection.jsx
│   │       └── ProductCard
│   │           └── WishlistButton.jsx  ← NEW
│   ├── /products → ProductsPage
│   │   └── ProductCard
│   │       └── WishlistButton.jsx
│   ├── /products/:id → ProductDetailPage
│   │   └── WishlistButton.jsx  ← NEW
│   └── /wishlist → WishlistPage.jsx  ← NEW
│       ├── BulkActions (Thêm tất cả / Xóa đã chọn)
│       └── WishlistItem.jsx[]  ← NEW
│           ├── WishlistButton.jsx
│           └── AddToCart / Navigate
│
├── CartDrawer.jsx (slide from right)
└── ToastContainer (react-hot-toast)
```

### A.2 Data Flow — Wishlist Toggle

```
User taps heart on ProductCard
  │
  ▼
WishlistButton.jsx
  ├── 1. Optimistic UI update (fill/unfill heart, update local state)
  ├── 2. Call wishlistService.addToWishlist(id) or removeFromWishlist(id)
  │      │
  │      ▼
  │   POST/DELETE /wishlist → Backend → WishlistController → WishlistService
  │      │
  │      ├── Success → toast (react-hot-toast), update WishlistIconHeader count
  │      └── Failure → revert UI, toast error
  │
  └── 3. WishlistIconHeader re-fetches count via GET /wishlist
```

### A.3 State Machine — WishlistButton

```
                 ┌──────────────────────┐
                 │   IDLE (unchecked)   │
                 └──────┬───────────────┘
                        │ mount
                        ▼
                 ┌──────────────┐
        ┌───────►│  CHECKING    │───────┐
        │        └──────────────┘       │
        │  GET /wishlist/check/{id}     │
        │        │                      │
        │    ┌───┴───┐             ┌────┴───┐
        │    │ false  │             │  true  │
        │    └───┬───┘             └────┬───┘
        │        ▼                      ▼
        │  ┌──────────┐          ┌──────────┐
        │  │ OUTLINE  │          │  FILLED  │
        │  │ (off)    │          │  (on)    │
        │  └────┬─────┘          └────┬─────┘
        │       │   tap               │   tap
        │       ▼                     ▼
        │  ┌──────────┐          ┌──────────┐
        │  │ ADDING   │          │ REMOVING │
        │  │POST /wl  │          │DELETE /wl│
        │  └────┬─────┘          └────┬─────┘
        │       │ success             │ success
        │       ▼                     ▼
        │  ┌──────────┐          ┌──────────┐
        └──│  FILLED  │          │ OUTLINE  │
           │  (+toast)│          │ (+toast) │
           └──────────┘          │ (+undo)  │
                                 └──────────┘

  Error path: stay in current visual state + toast error
  Undo path:  REMOVING → ADDING → FILLED (restore)
```

### A.4 WishlistPage State Machine

```
                    ┌─────────┐
                    │  MOUNT  │
                    └────┬────┘
                         │
                    GET /wishlist
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐ ┌────────┐ ┌────────┐
        │ LOADING │ │ EMPTY  │ │ ERROR  │
        │(skeleton)│ │(illus) │ │(retry) │
        └────┬─────┘ └────────┘ └───┬────┘
             │                       │ retry
             ▼                       └──► MOUNT
        ┌─────────┐
        │  LIST   │
        │ (items) │
        └────┬────┘
             │
     ┌───────┼──────────┐
     ▼       ▼          ▼
  REMOVE   ADD-TO-   NAVIGATE
  ITEM     CART      TO DETAIL
     │       │          │
     ▼       ▼          ▼
  (undo)   CartDrawer  ProductDetailPage
```

---

## Appendix B: Figma Handoff Spec (Measurements)

### B.1 Product Card with Wishlist (Mobile, 2-col grid)

```
┌──────────────────────────── 172px ────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐     │
│  │                    Image (1:1)                        │  172│
│  │                                                      │   px │
│  │                                        ┌──────────┐  │     │
│  │                                        │  ♥  32px │  │     │  ← Heart: 32×32px hit area
│  │                                        │  abs TR   │  │     │     position: absolute
│  │                                        └──────────┘  │     │     top: 8px, right: 8px
│  └──────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Áo thun cotton                            (16px pad)│     │
│  │  ────────────────────────────────────────  (margin)  │     │
│  │  ~~~~350.000₫~~~~  120.000₫                 14px    │     │  ← salePrice strikethrough
│  │  ────────────────────────────────────────  (margin)  │     │
│  │  ★ 4.5  |  Đã bán 1.2k                    12px     │     │
│  │  ────────────────────────────────────────  (margin)  │     │
│  │  ┌─────────────────────────────────────────────┐     │     │
│  │  │         Thêm vào giỏ       (full width)      │     │     │  ← 40px height
│  │  └─────────────────────────────────────────────┘     │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

### B.2 Wishlist Item Row (Mobile)

```
┌──────────────────────────────────── 100vw - 32px ────────────────────────────────┐
│ ☐ ┌──────────┐                                                         ┌──────┐ │
│   │  Image   │  Áo thun cotton                          16px            │  ♥   │ │
│   │  80×80   │  Màu: Đỏ · Size: XL              (between)              │ 24px │ │
│   │ rounded-xl│  120.000₫                                                └──────┘ │
│   └──────────┘  Giá hiện tại · Có thể thay đổi                                    │
│                  ┌──────────────────┐                                              │
│                  │ Chọn phân loại   │   ← or "Thêm vào giỏ"                        │
│                  └──────────────────┘                                              │
└───────────────────────────────────────────────────────────────────────────────────┘
  ↑ 12px pad all sides, 8px gap between image and text
```

### B.3 Header Heart Icon Spec

```
┌─────────────────────────────────────────────────────────────────┐
│  🛍️ SplitGo    Products  Features  Contact                     │
│                                                  ┌──────────┐   │
│                                                  │  ♥   3   │   │
│                                                  │  22px    │   │  ← Heart: 22px
│                                                  │          │   │     Badge: 14px circle
│                                                  └──────────┘   │     Count: 10px font
│                                               gap: 8px          │     Total clickable: 44×44px
│                                                       ┌──────┐  │
│                                                       │  🛒 3 │  │
│                                                       └──────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Vietnamese Copy Reference

| Context                    | Vietnamese                                          |
| -------------------------- | --------------------------------------------------- |
| Wishlist page title        | Danh sách yêu thích                                 |
| Add success toast          | Đã thêm vào Wishlist                                |
| Remove success toast       | Đã xóa khỏi Wishlist                                |
| Undo button                | Hoàn tác                                            |
| Heart button (add)         | Thêm vào wishlist                                   |
| Heart button (remove)      | Xóa khỏi wishlist                                   |
| Heart aria (add)           | Thêm vào wishlist, nút bật tắt                      |
| Heart aria (remove)        | Xóa khỏi wishlist, nút bật tắt, đã nhấn             |
| Add to cart (no variants)  | Thêm vào giỏ                                        |
| Add to cart (has variants) | Chọn phân loại                                      |
| Variant nav toast          | Vui lòng chọn phân loại hàng trước khi thêm vào giỏ |
| Price note                 | Giá hiện tại · Có thể thay đổi                      |
| Empty state heading        | Bạn chưa lưu sản phẩm nào                           |
| Empty state body           | Thêm sản phẩm bạn thích để mua sau nhé.             |
| Empty state CTA            | Mua sắm ngay                                        |
| Bulk add all               | Thêm tất cả vào giỏ                                 |
| Bulk remove selected       | Xóa đã chọn                                         |
| Bulk add progress          | Đang thêm {n}/{total} sản phẩm...                   |
| Bulk add done              | Đã thêm {n} sản phẩm vào giỏ                        |
| Bulk variants skipped      | {n} sản phẩm cần chọn phân loại                     |
| Loading skeleton           | Đang tải...                                         |
| Error message              | Không thể tải danh sách yêu thích                   |
| Retry button               | Thử lại                                             |
| Header aria (0 items)      | Danh sách yêu thích, trống                          |
| Header aria (n items)      | Danh sách yêu thích, {n} sản phẩm                   |
| Login required toast       | Vui lòng đăng nhập để dùng tính năng này            |
| API error generic          | Có lỗi xảy ra, vui lòng thử lại                     |
