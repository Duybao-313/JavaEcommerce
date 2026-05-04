import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CreateProductPage from "./pages/CreateProductPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfilePage from "./pages/UserProfilePage";
import SellerLayout, {
  SellerDashboardHome,
  SellerOrdersHistoryPage,
} from "./pages/SellerDashboardPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<Navigate to="/seller/products" replace />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/me" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
