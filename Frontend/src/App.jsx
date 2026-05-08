import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CreateProductPage from "./pages/CreateProductPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfilePage from "./pages/UserProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerLayout, { SellerDashboardHome } from "./pages/SellerDashboardPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminShippingsPage from "./pages/admin/AdminShippingsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import { getAuthSession, hasRole } from "./services/sessionService";
import "./App.css";

function RoleRoute({ allowedRoles }) {
  const session = getAuthSession();
  const isAllowed = allowedRoles.some((role) => hasRole(session, role));

  if (!isAllowed) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
}

function LandingGuard({ children }) {
  const session = getAuthSession();

  if (hasRole(session, "ADMIN")) {
    return <Navigate to="/admin" replace />;
  }

  if (hasRole(session, "SELLER")) {
    return <Navigate to="/seller" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingGuard>
            <LandingPage />
          </LandingGuard>
        }
      />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/me" element={<UserProfilePage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />

      <Route element={<RoleRoute allowedRoles={["SELLER"]} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboardHome />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/create" element={<CreateProductPage />} />
        </Route>
        <Route
          path="/products/create"
          element={<Navigate to="/seller/products/create" replace />}
        />
        <Route
          path="/products/mine"
          element={<Navigate to="/seller/products" replace />}
        />
      </Route>

      <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="shippings" element={<AdminShippingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
