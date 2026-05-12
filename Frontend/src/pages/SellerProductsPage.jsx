import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCategories } from "../services/categoryService";
import {
  deleteSellerProduct,
  getProductsBySeller,
  updateSellerProduct,
  updateSellerProductImage,
} from "../services/productService";
import { getAuthSession } from "../services/sessionService";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [imageSavingId, setImageSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [hiddenFilter, setHiddenFilter] = useState("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    status: "ACTIVE",
    categoryId: "",
  });

  useEffect(() => {
    const current = getAuthSession();

    if (!current?.token) {
      navigate("/login", { replace: true });
      return;
    }

    const currentSellerId =
      current?.user?.id || current?.id || current?.sellerId || null;

    if (!currentSellerId) {
      toast.error("Không tìm thấy thông tin seller trong phiên đăng nhập");
      navigate("/products", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [sellerProducts, categoryList] = await Promise.all([
          getProductsBySeller(currentSellerId),
          getCategories().catch(() => []),
        ]);

        if (!cancelled) {
          setProducts(sellerProducts);
          setCategories(categoryList);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.message || "Không thể tải sản phẩm đã tạo");
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const hasMin = Number.isFinite(min) && min > 0;
    const hasMax = Number.isFinite(max) && max > 0;

    const result = products.filter((product) => {
      const matchName =
        !keyword || normalizeText(product?.name).includes(keyword);
      const categoryId = String(
        product?.category?.id || product?.categoryId || "",
      );
      const matchCategory =
        selectedCategory === "all" || selectedCategory === categoryId;

      const stock = Number(product?.stock || 0);
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && stock > 0) ||
        (stockFilter === "outOfStock" && stock <= 0) ||
        (stockFilter === "lowStock" && stock > 0 && stock <= 10);

      const price = Number(product?.price || 0);
      const matchMin = !hasMin || price >= min;
      const matchMax = !hasMax || price <= max;

      const isHidden = product?.status === "INACTIVE";
      const matchHidden =
        hiddenFilter === "all" ||
        (hiddenFilter === "hidden" && isHidden) ||
        (hiddenFilter === "visible" && !isHidden);

      return (
        matchName &&
        matchCategory &&
        matchStock &&
        matchMin &&
        matchMax &&
        matchHidden
      );
    });

    if (priceSort === "asc") {
      result.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    }

    if (priceSort === "desc") {
      result.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    priceSort,
    hiddenFilter,
  ]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product?.name || "",
      description: product?.description || "",
      price: String(product?.price ?? ""),
      stock: String(product?.stock ?? ""),
      status: product?.status || "ACTIVE",
      categoryId:
        product?.category?.id || product?.categoryId
          ? String(product?.category?.id || product.categoryId)
          : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      status: "ACTIVE",
      categoryId: "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (productId) => {
    const payload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      status: editForm.status,
      categoryId: editForm.categoryId ? Number(editForm.categoryId) : null,
    };

    if (
      !payload.name ||
      !Number.isFinite(payload.price) ||
      payload.price <= 0
    ) {
      toast.error("Vui lòng nhập tên và giá sản phẩm hợp lệ");
      return;
    }

    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      toast.error("Tồn kho không hợp lệ");
      return;
    }

    setSavingId(productId);
    try {
      const updated = await updateSellerProduct(productId, payload);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, ...updated } : item,
        ),
      );
      toast.success("Cập nhật sản phẩm thành công");
      cancelEdit();
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật sản phẩm");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Bạn có chắc muốn tạm ẩn sản phẩm này?");
    if (!confirmed) return;

    setSavingId(productId);
    try {
      await deleteSellerProduct(productId);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                status: "INACTIVE",
              }
            : item,
        ),
      );
      toast.success("Đã tạm ẩn sản phẩm");
    } catch (error) {
      toast.error(error?.message || "Không thể tạm ẩn sản phẩm");
    } finally {
      setSavingId(null);
    }
  };

  const handleImageSelect = (productId, event) => {
    const file = event.target.files?.[0] || null;
    setImageFiles((prev) => ({ ...prev, [productId]: file }));
  };

  const handleUpdateImage = async (productId) => {
    const file = imageFiles[productId];
    if (!file) {
      toast.error("Vui lòng chọn ảnh trước khi cập nhật");
      return;
    }

    setImageSavingId(productId);
    try {
      const updated = await updateSellerProductImage(productId, file);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, ...updated } : item,
        ),
      );
      setImageFiles((prev) => ({ ...prev, [productId]: null }));
      toast.success("Cập nhật ảnh sản phẩm thành công");
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật ảnh sản phẩm");
    } finally {
      setImageSavingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              SplitGo Seller
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Sản phẩm đã tạo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              {isFilterPanelOpen ? "Ẩn bộ lọc" : "Bộ lọc"}
            </button>
            <Link
              to="/seller/products/create"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700"
            >
              Tạo sản phẩm
            </Link>
            <Link
              to="/me"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
            >
              Thông tin tài khoản
            </Link>
          </div>
        </header>

        {isFilterPanelOpen && (
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="md:col-span-2 lg:col-span-3">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-product-search"
                >
                  Tìm kiếm theo tên sản phẩm
                </label>
                <input
                  id="seller-product-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-category-filter"
                >
                  Danh mục
                </label>
                <select
                  id="seller-category-filter"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-stock-filter"
                >
                  Số lượng
                </label>
                <select
                  id="seller-stock-filter"
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="all">Tất cả</option>
                  <option value="inStock">Còn hàng</option>
                  <option value="outOfStock">Hết hàng</option>
                  <option value="lowStock">Sắp hết (1-10)</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-hidden-filter"
                >
                  Sản phẩm đã ẩn
                </label>
                <select
                  id="seller-hidden-filter"
                  value={hiddenFilter}
                  onChange={(event) => setHiddenFilter(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="all">Tất cả</option>
                  <option value="visible">Chưa ẩn</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-price-sort"
                >
                  Giá tiền
                </label>
                <select
                  id="seller-price-sort"
                  value={priceSort}
                  onChange={(event) => setPriceSort(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                >
                  <option value="default">Mặc định</option>
                  <option value="asc">Thấp đến cao</option>
                  <option value="desc">Cao đến thấp</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-min-price"
                >
                  Giá từ
                </label>
                <input
                  id="seller-min-price"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-max-price"
                >
                  Giá đến
                </label>
                <input
                  id="seller-max-price"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Đang tải sản phẩm của bạn...
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            Bạn chưa tạo sản phẩm nào.
          </div>
        )}

        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const isEditing = editingId === product.id;
              const isSaving = savingId === product.id;
              const isImageSaving = imageSavingId === product.id;
              const selectedImage = imageFiles[product.id];
              const isHidden = product.status === "INACTIVE";

              return (
                <article
                  key={product.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isHidden
                      ? "border-amber-400 bg-amber-50/30"
                      : "border-zinc-200"
                  }`}
                >
                  {!isEditing && (
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {product?.category?.name ||
                              product.categoryName ||
                              "Chưa có danh mục"}
                          </p>
                          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                            {product.name}
                          </h2>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            isHidden
                              ? "border-amber-300 bg-amber-100 text-amber-700"
                              : "border-emerald-300 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-600">
                        {product.description || "-"}
                      </p>

                      <div className="mt-3 h-40 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500">
                            Chưa có ảnh sản phẩm
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-zinc-700 md:grid-cols-2 lg:grid-cols-4">
                        <p>
                          Giá:{" "}
                          <span className="font-semibold text-zinc-900">
                            {formatPrice(product.price)}
                          </span>
                        </p>
                        <p>
                          Tồn kho:{" "}
                          <span className="font-semibold text-zinc-900">
                            {product.stock}
                          </span>
                        </p>
                        <p>
                          Đã bán:{" "}
                          <span className="font-semibold text-zinc-900">
                            {Number(product?.soldCount || 0).toLocaleString(
                              "vi-VN",
                            )}
                          </span>
                        </p>
                        <p>
                          Đã ẩn:{" "}
                          <span className="font-semibold text-zinc-900">
                            {isHidden ? "Có" : "Không"}
                          </span>
                        </p>
                        <p>
                          Lượt xem:{" "}
                          <span className="font-semibold text-zinc-900">
                            {Number(product?.viewCount || 0).toLocaleString(
                              "vi-VN",
                            )}
                          </span>
                        </p>
                        <p>
                          Trạng thái:{" "}
                          <span className="font-semibold text-zinc-900">
                            {product.status}
                          </span>
                        </p>
                        <p>
                          ID:{" "}
                          <span className="font-semibold text-zinc-900">
                            #{product.id}
                          </span>
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
                        >
                          Cập nhật
                        </button>

                        <input
                          id={`seller-image-${product.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleImageSelect(product.id, event)
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor={`seller-image-${product.id}`}
                          className="cursor-pointer rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900"
                        >
                          Sửa ảnh
                        </label>
                        <button
                          onClick={() => handleUpdateImage(product.id)}
                          disabled={isImageSaving || !selectedImage}
                          className="rounded-full border border-blue-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isImageSaving ? "Đang cập nhật ảnh..." : "Lưu ảnh"}
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isSaving || isHidden}
                          className="rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSaving
                            ? "Đang ẩn..."
                            : isHidden
                              ? "Đã ẩn"
                              : "Tạm thời ẩn"}
                        </button>
                      </div>

                      {selectedImage && (
                        <p className="mt-2 text-xs text-zinc-600">
                          Ảnh đã chọn: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Cập nhật sản phẩm #{product.id}
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-zinc-700">
                          Tên sản phẩm
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Giá
                          <input
                            type="number"
                            min="1"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Tồn kho
                          <input
                            type="number"
                            min="0"
                            name="stock"
                            value={editForm.stock}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Trạng thái
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </label>

                        <label className="text-sm text-zinc-700 md:col-span-2">
                          Danh mục
                          <select
                            name="categoryId"
                            value={editForm.categoryId}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          >
                            <option value="">
                              Giữ nguyên danh mục hiện tại
                            </option>
                            {categories.map((category) => (
                              <option
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-sm text-zinc-700 md:col-span-2">
                          Mô tả
                          <textarea
                            name="description"
                            rows={3}
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(product.id)}
                          disabled={isSaving}
                          className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isSaving ? "Đang lưu..." : "Lưu cập nhật"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProductsPage;
