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
import NotFoundPage from "./pages/NotFoundPage";
import SellerLayout, {
  SellerDashboardHome,
  SellerOrdersHistoryPage,
} from "./pages/SellerDashboardPage";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/me" element={<UserProfilePage />} />

      <Route element={<RoleRoute allowedRoles={["SELLER"]} />}>
        <Route
          path="/seller"
          element={<Navigate to="/seller/dashboard" replace />}
        />
        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerDashboardHome />} />
          <Route path="orders" element={<SellerOrdersHistoryPage />} />
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
        <Route
          path="/admin"
          element={<div className="p-8">Admin Dashboard</div>}
        />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
