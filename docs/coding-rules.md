# Coding Rules — SplitGo

> **Last Updated**: 2026-05-31

---

## 1. Backend (Java / Spring Boot)

### 1.1 Project Conventions

| Rule                | Standard                                     |
| ------------------- | -------------------------------------------- |
| **Java Version**    | 17                                           |
| **Spring Boot**     | 4.0.5                                        |
| **Build Tool**      | Maven                                        |
| **Base Package**    | `com.duybao.SplitGo`                         |
| **Code Formatting** | Spotless Maven Plugin (Palantir Java Format) |
| **Indentation**     | Tabs, 4 spaces per tab                       |

### 1.2 Naming Conventions

| Layer                 | Convention                         | Example                                            |
| --------------------- | ---------------------------------- | -------------------------------------------------- |
| **Entity**            | `PascalCase`, singular noun        | `Product`, `OrderItem`                             |
| **DTO Request**       | `{Action}{Entity}Request`          | `CreateProductRequest`, `UpdateOrderStatusRequest` |
| **DTO Response**      | `{Entity}Response` / `{Entity}Dto` | `ProductResponse`, `CouponDto`                     |
| **Controller**        | `{Entity}Controller`               | `ProductController`                                |
| **Service Interface** | `{Entity}Service`                  | `CartService`                                      |
| **Service Impl**      | `{Entity}ServiceImpl`              | `CartServiceImpl`                                  |
| **Repository**        | `{Entity}Repository`               | `UserRepository`                                   |
| **Enum**              | `PascalCase`                       | `OrderStatus`, `PaymentMethod`                     |

### 1.3 Package Organization

```
com.duybao.SplitGo/
├── Config/       ← @Configuration classes
├── Controller/   ← @RestController classes
├── Service/      ← Interfaces only
│   └── Impl/     ← @Service implementations
├── Repository/   ← JpaRepository interfaces
├── Model/        ← @Entity classes
├── DTO/
│   ├── request/  ← Incoming DTOs
│   │   ├── admin/
│   │   └── ecommerce/
│   └── Response/ ← Outgoing DTOs
│       ├── User/
│       └── ecommerce/
├── Enum/         ← Enum classes
├── Exception/    ← Custom exceptions + handler
└── Mappers/      ← MapStruct interfaces
```

### 1.4 Entity Rules

- Use `@Entity` + `@Table(name = "...")` — table names are **plural** (`users`, `products`, `orders`)
- Use Lombok: `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`
- Use `@PrePersist` / `@PreUpdate` for automatic timestamps
- FK relations: `@ManyToOne(fetch = FetchType.LAZY)` always
- Collections: `@OneToMany(mappedBy = "...", cascade = CascadeType.ALL, orphanRemoval = true)`
- JSON columns: use custom `@Convert` with `JsonMapConverter` or `JsonListConverter`
- Use `@Version` for entities needing optimistic locking (ProductVariant, Coupon)
- Always use `@Builder.Default` for fields with default values in `@Builder` classes

### 1.5 Controller Rules

- Use `@RestController` + `@RequestMapping("/resource")`
- Return `ApiResponse<T>` wrapper for all endpoints
- Use `@Valid` for request body validation
- Use `@AuthenticationPrincipal User user` for current user
- Use `@PreAuthorize("hasRole('...')")` for role-based access
- Use `@PathVariable` for resource IDs, `@RequestParam` for filters
- Multipart uploads: use `@RequestPart` + `MediaType.MULTIPART_FORM_DATA_VALUE`
- Controller methods should be thin — delegate to Service

### 1.6 Service Rules

- **Always** create an interface + implementation pair
- Service interfaces define business method contracts
- `@Service` annotation on implementation classes only
- Use constructor injection (`@RequiredArgsConstructor`)
- Transactional operations: annotate with `@Transactional` on service methods
- Error handling: throw `AppException(ErrorCode.XXX)` — never return null/error codes

### 1.7 Exception Handling

- All exceptions extend `AppException(ErrorCode errorCode)`
- `ErrorCode.java` defines domain-specific codes with HTTP status mapping
- `GlobalExceptionHandler` (`@ControllerAdvice`) catches all exceptions
- Response format: `{ success: false, code, message, errors }`

### 1.8 DTO Rules

- Request DTOs: use `@Valid` annotations (`@NotNull`, `@NotBlank`, `@Min`, `@Max`)
- Response DTOs: use `@Builder`
- MapStruct mappers for Entity ↔ DTO conversion
- Use `@JsonProperty("snake_case")` for JSON field naming when needed

### 1.9 Security Rules

- All endpoints except auth + public product/category are protected
- JWT token extracted from `Authorization: Bearer <token>` header
- Token invalidation on logout (stored in `invalidated_token` table)
- Role checks: `@PreAuthorize("hasRole('ADMIN')")` on controller or method level

---

## 2. Frontend (React / JavaScript)

### 2.1 Project Conventions

| Rule           | Standard                       |
| -------------- | ------------------------------ |
| **Runtime**    | Node.js 18+                    |
| **Build Tool** | Vite 5                         |
| **Styling**    | Tailwind CSS 4 (utility-first) |
| **State**      | React Context + local state    |
| **HTTP**       | Fetch API via `apiClient.js`   |
| **Routing**    | React Router DOM v6            |
| **Formatting** | ESLint 9 (flat config)         |

### 2.2 File Naming

| Type           | Convention                  | Example                             |
| -------------- | --------------------------- | ----------------------------------- |
| **Pages**      | `PascalCasePage.jsx`        | `ProductDetailPage.jsx`             |
| **Components** | `PascalCase.jsx`            | `CartDrawer.jsx`, `FilterPanel.jsx` |
| **Services**   | `camelCaseService.js`       | `productService.js`                 |
| **Context**    | `PascalCaseContext.jsx`     | `CartContext.jsx`                   |
| **Constants**  | `camelCase.js`              | `orderStatus.js`                    |
| **Styles**     | Match component name `.css` | `Header.css`                        |

### 2.3 Component Rules

- Use **functional components** with hooks
- One component per file (except trivial sub-components)
- Props: destructure in function signature
- Use `motion` (Framer Motion) for animations
- Keep components focused — extract reusable parts to `/components/`
- Use Tailwind classes directly in JSX, no separate CSS modules unless necessary

### 2.4 Service Layer Rules

- All API calls go through `apiClient.js` (`request()` + `parseApiResponse()`)
- Each domain has its own service file (`authService`, `productService`, etc.)
- Services export async functions that return parsed data
- JWT tokens: stored in `localStorage`, attached via `apiClient` interceptor
- Error handling: catch errors in calling component, show via `react-hot-toast`

### 2.5 Routing Rules

- Use `react-router-dom` v6 `<Routes>` + `<Route>` in `App.jsx`
- Protected routes: check auth state before rendering
- Use `useParams()` for URL parameters, `useSearchParams()` for query strings
- 404 fallback: `<Route path="*" element={<NotFoundPage />} />`

### 2.6 Styling Rules

- **Tailwind-first**: use utility classes in JSX
- Custom CSS files only for complex animations or component-specific overrides
- Responsive: `sm:`, `md:`, `lg:` breakpoints
- Dark mode: not yet implemented
- Colors: Tailwind default palette + `amber` accent for brand
- Motion: prefer `motion.div` over raw CSS transitions

### 2.7 State Management Rules

- **Global state** (cart): React Context (`CartContext.jsx`)
- **Server state**: fetched in component via `useEffect` + service call
- **Form state**: local `useState` for each field
- No external state library (Redux, Zustand) — evaluate if complexity grows

---

## 3. Database Rules

- Table names: **plural, lowercase** (`users`, `products`, `orders`)
- Column names: **snake_case** (`created_at`, `seller_id`)
- Java fields: **camelCase** (JPA auto-maps)
- Always use `@Column` with explicit length for VARCHAR fields
- Use `precision` and `scale` for DECIMAL columns (money: 19,2; ratings: 3,2)
- FK columns: explicitly named (`@JoinColumn(name = "seller_id")`)
- Timestamps: `LocalDateTime` in Java, `DATETIME` in MySQL

---

## 4. Git Conventions

- Branch naming: `feature/xxx`, `fix/xxx`, `refactor/xxx`
- Commit messages: Vietnamese or English, descriptive
- No committing: `target/`, `node_modules/`, `.env` files

---

## 5. API Conventions

- Base path: RESTful nouns (`/products`, `/orders`, `/auth`)
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- Response wrapper: `ApiResponse<T>` with `success`, `code`, `message`, `data`, `timestamp`
- Pagination: `PageResponse<T>` with `content`, `totalElements`, `totalPages`, `currentPage`
- Status codes: 200 (OK), 201 (Created), 204 (No Content), 400, 401, 403, 404, 409
- Error codes: domain-specific in `ErrorCode.java`
