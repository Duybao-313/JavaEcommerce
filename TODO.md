# TODO - Role-based routing & 404 protection

- [x] Add role-based redirect after login:
  - ADMIN -> `/admin`
  - USER -> `/products`
  - SELLER -> `/seller`
- [x] Update app routes:
  - `/products` should render customer products page (not seller redirect)
  - add `/admin` route
  - add `/seller` route entry
- [x] Add protected route guards by role:
  - unauthorized access should go to 404 page
- [x] Create 404 page and wire `*` fallback to 404
- [ ] Verify flow:
  - login as admin/user/seller
  - direct URL access with wrong role -> 404
