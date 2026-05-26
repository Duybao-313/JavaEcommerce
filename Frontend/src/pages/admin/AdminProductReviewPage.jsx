import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import ProductReviewFilters from "../../components/admin/products/ProductReviewFilters";
import ProductReviewList from "../../components/admin/products/ProductReviewList";
import ProductReviewDrawer from "../../components/admin/products/ProductReviewDrawer";
import PaginationBar from "../../components/admin/PaginationBar";
import {
  getPendingProducts,
  updateProductStatus,
} from "../../services/productService";
import "../../components/admin/products/products-admin.css";

const PAGE_SIZE = 10;

/**
 * AdminProductReviewPage — admin dashboard for reviewing seller-created products.
 *
 * Features:
 * - Filter by status (All, Pending, Rejected, Pending Changes, Approved)
 * - Search by name/SKU
 * - Click row → detail drawer with full product info + audit timeline
 * - Approve / Reject (with reason) / Request Changes (with reason)
 * - Optimistic UI, toast feedback, pagination
 * - Mobile-first responsive with accessible markup
 */
export default function AdminProductReviewPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [activeTab, debouncedSearch]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (activeTab !== "ALL") params.status = activeTab;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await getPendingProducts(params);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error(err.message || "Không thể tải danh sách sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open detail drawer
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // Keep selected product in state until animation completes
    setTimeout(() => setSelectedProduct(null), 260);
  };

  // Status update handler (with optimistic UI)
  const handleStatusUpdate = async (productId, payload) => {
    // Optimistic: update local state immediately
    const optimisticStatus = payload.status;
    const prevProducts = [...products];

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: optimisticStatus,
              adminNote: payload.reason || p.adminNote,
            }
          : p,
      ),
    );

    // Also update selected product in drawer
    if (selectedProduct?.id === productId) {
      setSelectedProduct((prev) => ({
        ...prev,
        status: optimisticStatus,
        adminNote: payload.reason || prev.adminNote,
      }));
    }

    try {
      await updateProductStatus(productId, payload);

      const messages = {
        ACTIVE: "Đã duyệt sản phẩm thành công",
        APPROVED: "Đã duyệt sản phẩm thành công",
        REJECTED: "Đã từ chối sản phẩm",
        PENDING_CHANGES: "Đã gửi yêu cầu chỉnh sửa",
      };
      toast.success(
        messages[payload.status] || "Cập nhật trạng thái thành công",
      );

      // Refresh list to get server-authoritative state
      fetchProducts();
    } catch (err) {
      // Rollback on error
      setProducts(prevProducts);
      if (selectedProduct?.id === productId) {
        setSelectedProduct((prev) => ({
          ...prev,
          status: prevProducts.find((p) => p.id === productId)?.status,
        }));
      }
      toast.error(err.body?.message || err.message || "Cập nhật thất bại");
      throw err; // re-throw so drawer knows it failed
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "oklch(0.5 0.01 90)",
            marginBottom: "0.25rem",
          }}
        >
          Admin
        </p>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "oklch(0.15 0.005 90)",
            margin: 0,
          }}
        >
          Duyệt sản phẩm
        </h1>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "oklch(0.45 0.01 90)",
            marginTop: "0.25rem",
          }}
        >
          {totalElements > 0
            ? `${totalElements} sản phẩm — xem xét và duyệt sản phẩm từ người bán`
            : "Quản lý sản phẩm chờ duyệt từ người bán"}
        </p>
      </div>

      {/* Filters */}
      <ProductReviewFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Product list */}
      <ProductReviewList
        products={products}
        loading={loading}
        activeTab={activeTab}
        onSelectProduct={handleSelectProduct}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: "1.25rem" }}>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detail drawer */}
      <ProductReviewDrawer
        product={selectedProduct}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
