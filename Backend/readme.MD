### docker guide
# build docker image
docker build -t <account name>/splitgo:0.0.4 .
# push docker image to docker hub
docker image push <account name>/splitgo:0.0.4

# build
docker build -t name:version
docker build -t splitgo:0.0.3 .
# run
docker run --name splitGo -p 8080:8080 -e DBMS_CONNECTION=jdbc:mysql://mysql1:3306/bill splitgo:0.0.3 
# create network
docker network create splitgo-network
docker network ls
# run mysql in network
docker run --network splitgo-network --name mysql1 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql

## Ecommerce Sprint 1 (Buyer + Seller)
Da bo sung cac module backend:
- Catalog: san pham, danh muc
- Cart: gio hang
- Order: checkout COD, lich su don
- Seller operations: tao/sua/an san pham, cap nhat trang thai don

### Vai tro
- `ROLE_USER`: buyer
- `ROLE_SELLER`: seller
- `ROLE_ADMIN`: admin

### API chinh
- `GET /products`, `GET /products/{id}`
- `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` (seller)
- `GET /cart`, `POST /cart/items`, `PUT /cart/items/{cartItemId}`, `DELETE /cart/items/{cartItemId}` (buyer)
- `POST /orders/checkout`, `GET /orders/my` (buyer)
- `GET /seller/orders`, `PATCH /seller/orders/{orderId}/status` (seller)

### Test nhanh
Chay test voi H2 in-memory:
- `./mvnw test`

Test integration da co:
- `src/test/java/com/duybao/SplitGo/EcommerceFlowIntegrationTest.java`
