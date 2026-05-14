import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCategories } from "../services/categoryService";
import {
  getProductsBySeller,
  updateSellerProduct,
  updateSellerProductImage,
} from "../services/productService";
import { getProductReviews } from "../services/reviewService";
import { getAuthSession } from "../services/sessionService";

// ─── Helpers ────────────────────────────────────────────────────────
function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function discountPercent(price, salePrice) {
  if (!price || !salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// ─── Inline SVG icons ───────────────────────────────────────────────
const IconEye = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconStar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconCopy = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconComment = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconExternal = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="31.4 31.4"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Initial form state ─────────────────────────────────────────────
const initialEditForm = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  weight: "",
  sku: "",
  status: "ACTIVE",
  categoryId: "",
  isFeatured: false,
};

// ─── Component ──────────────────────────────────────────────────────
function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [imageSavingId, setImageSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [toggleConfirmId, setToggleConfirmId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loadingReviewsId, setLoadingReviewsId] = useState(null);

  // Options & Variants editing state
  const [editOptions, setEditOptions] = useState([]);
  const [editVariants, setEditVariants] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [editForm, setEditForm] = useState(initialEditForm);

  // ─── Load data ────────────────────────────────────────────────────
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
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ─── Filtering & Sorting ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const hasMin = Number.isFinite(min) && min > 0;
    const hasMax = Number.isFinite(max) && max > 0;

    const result = products.filter((product) => {
      const matchSearch =
        !keyword ||
        normalizeText(product?.name).includes(keyword) ||
        normalizeText(product?.sku || "").includes(keyword) ||
        normalizeText(product?.slug || "").includes(keyword);

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

      const matchFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && product?.isFeatured === true) ||
        (featuredFilter === "notFeatured" && product?.isFeatured !== true);

      const hasSale =
        product?.salePrice &&
        Number(product.salePrice) > 0 &&
        Number(product.salePrice) < Number(product.price);
      const matchSale =
        saleFilter === "all" ||
        (saleFilter === "onSale" && hasSale) ||
        (saleFilter === "notOnSale" && !hasSale);

      return (
        matchSearch &&
        matchCategory &&
        matchStock &&
        matchMin &&
        matchMax &&
        matchHidden &&
        matchFeatured &&
        matchSale
      );
    });

    if (sortBy === "createdAt_desc")
      result.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
      );
    if (sortBy === "createdAt_asc")
      result.sort(
        (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0),
      );
    if (sortBy === "soldCount_desc")
      result.sort(
        (a, b) => Number(b?.soldCount || 0) - Number(a?.soldCount || 0),
      );
    if (sortBy === "viewCount_desc")
      result.sort(
        (a, b) => Number(b?.viewCount || 0) - Number(a?.viewCount || 0),
      );

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    stockFilter,
    minPrice,
    maxPrice,
    hiddenFilter,
    featuredFilter,
    saleFilter,
    sortBy,
  ]);

  // ─── Edit handlers ────────────────────────────────────────────────
  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price != null ? String(product.price) : "",
      salePrice: product?.salePrice != null ? String(product.salePrice) : "",
      stock: product?.stock != null ? String(product.stock) : "",
      weight: product?.weight != null ? String(product.weight) : "",
      sku: product?.sku || "",
      status: product?.status || "ACTIVE",
      categoryId:
        product?.category?.id || product?.categoryId
          ? String(product?.category?.id || product.categoryId)
          : "",
      isFeatured: product?.isFeatured === true,
    });
    // Load existing options & variants for editing
    const existingOptions =
      product?.options && product.options.length > 0
        ? product.options.map((o) => ({
            name: o.name || "",
            values: (o.values || []).join(", "),
          }))
        : [];
    const existingVariants =
      product?.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            sku: v.sku || "",
            attrs: v.attributes || {},
            price: v.price != null ? String(v.price) : "",
            stock: v.stock != null ? String(v.stock) : "",
            salePrice: v.salePrice != null ? String(v.salePrice) : "",
            imageUrl: v.imageUrl || "",
          }))
        : [];
    setEditOptions(existingOptions);
    setEditVariants(existingVariants);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialEditForm);
    setEditOptions([]);
    setEditVariants([]);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (productId) => {
    const payload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      price: editForm.price ? Number(editForm.price) : null,
      stock: editForm.stock ? Number(editForm.stock) : null,
      status: editForm.status,
      categoryId: editForm.categoryId ? Number(editForm.categoryId) : null,
      salePrice: editForm.salePrice ? Number(editForm.salePrice) : null,
      weight: editForm.weight ? Number(editForm.weight) : null,
      sku: editForm.sku.trim() || null,
      isFeatured: editForm.isFeatured,
      options:
        editOptions.length > 0
          ? editOptions
              .filter((o) => o.name.trim())
              .map((o) => ({
                name: o.name.trim(),
                values: o.values
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              }))
          : null,
      variants:
        editVariants.length > 0
          ? editVariants
              .filter((v) => v.attrs && Object.keys(v.attrs).length > 0)
              .map((v) => ({
                sku: v.sku?.trim() || null,
                attributes: v.attrs,
                price: Number(v.price),
                stock: Number(v.stock),
                salePrice: v.salePrice ? Number(v.salePrice) : null,
                imageUrl: v.imageUrl?.trim() || null,
              }))
          : null,
    };

    if (!payload.name) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error("Giá sản phẩm phải > 0");
      return;
    }
    if (
      payload.stock !== null &&
      (!Number.isFinite(payload.stock) || payload.stock < 0)
    ) {
      toast.error("Tồn kho không hợp lệ");
      return;
    }
    if (payload.salePrice !== null && payload.salePrice > payload.price) {
      toast.error("Giá khuyến mại không được lớn hơn giá gốc");
      return;
    }
    if (
      payload.weight !== null &&
      (!Number.isFinite(payload.weight) || payload.weight < 0)
    ) {
      toast.error("Khối lượng không hợp lệ");
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

  // ─── Toggle visibility ────────────────────────────────────────────
  const handleToggleVisibility = async (productId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setSavingId(productId);
    try {
      const updated = await updateSellerProduct(productId, {
        status: newStatus,
      });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, ...updated } : item,
        ),
      );
      toast.success(
        newStatus === "ACTIVE" ? "Đã hiển thị sản phẩm" : "Đã ẩn sản phẩm",
      );
      setToggleConfirmId(null);
    } catch (error) {
      toast.error(error?.message || "Không thể thay đổi trạng thái");
    } finally {
      setSavingId(null);
    }
  };

  // ─── Image handlers ───────────────────────────────────────────────
  const handleImageSelect = (productId, event) => {
    const file = event.target.files?.[0] || null;
    setImageFiles((prev) => ({ ...prev, [productId]: file }));
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => ({ ...prev, [productId]: previewUrl }));
    } else {
      setImagePreviews((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
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
      setImagePreviews((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      toast.success("Cập nhật ảnh sản phẩm thành công");
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật ảnh sản phẩm");
    } finally {
      setImageSavingId(null);
    }
  };

  // ─── Bulk actions ─────────────────────────────────────────────────
  const toggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;
    if (!bulkAction) return;
    setBulkSaving(true);
    const ids = [...selectedIds];

    let success = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        const payload =
          bulkAction === "hide"
            ? { status: "INACTIVE" }
            : bulkAction === "show"
              ? { status: "ACTIVE" }
              : bulkAction === "feature"
                ? { isFeatured: true }
                : { isFeatured: false };
        const updated = await updateSellerProduct(id, payload);
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
        );
        success++;
      } catch {
        failed++;
      }
    }
    const label =
      bulkAction === "hide"
        ? "ẩn"
        : bulkAction === "show"
          ? "hiển thị"
          : bulkAction === "feature"
            ? "đánh dấu nổi bật"
            : "bỏ nổi bật";
    toast.success(
      `Đã ${label} ${success} sản phẩm${failed > 0 ? `, ${failed} thất bại` : ""}`,
    );
    setSelectedIds(new Set());
    setBulkAction(null);
    setBulkSaving(false);
  };

  // ─── Options & Variants edit helpers ──────────────────────────────
  const handleEditOptionChange = (index, field, value) => {
    setEditOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEditOption = () => {
    setEditOptions((prev) => [...prev, { name: "", values: "" }]);
  };

  const removeEditOption = (index) => {
    setEditOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const generateEditCombinations = () => {
    const parsed = editOptions
      .map((o) => ({
        name: o.name.trim(),
        values: o.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((o) => o.name && o.values.length > 0);

    if (parsed.length === 0) {
      toast.error("Hãy định nghĩa ít nhất 1 option với tên và giá trị");
      return;
    }

    const combinations = parsed.reduce(
      (acc, curr) => acc.flatMap((a) => curr.values.map((b) => [...a, b])),
      [[]],
    );

    const generated = combinations.map((combo) => {
      const attrs = {};
      parsed.forEach((o, i) => {
        attrs[o.name] = combo[i];
      });
      return {
        sku: "",
        attrs,
        price: "",
        stock: "",
        salePrice: "",
        imageUrl: "",
      };
    });

    setEditVariants(generated);
    toast.success(`Đã tạo ${generated.length} biến thể từ các option`);
  };

  const handleEditVariantChange = (variantIndex, field, value) => {
    setEditVariants((prev) => {
      const next = [...prev];
      next[variantIndex] = { ...next[variantIndex], [field]: value };
      return next;
    });
  };

  const addEditVariant = () => {
    setEditVariants((prev) => [
      ...prev,
      { sku: "", attrs: {}, price: "", stock: "", salePrice: "", imageUrl: "" },
    ]);
  };

  const removeEditVariant = (index) => {
    setEditVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Review loader ────────────────────────────────────────────────
  const loadReviews = async (productId) => {
    if (reviewsMap[productId]) {
      setExpandedId(expandedId === productId ? null : productId);
      return;
    }
    setLoadingReviewsId(productId);
    setExpandedId(productId);
    try {
      const reviews = await getProductReviews(productId);
      setReviewsMap((prev) => ({ ...prev, [productId]: reviews || [] }));
    } catch {
      setReviewsMap((prev) => ({ ...prev, [productId]: [] }));
    } finally {
      setLoadingReviewsId(null);
    }
  };

  // ─── Copy to clipboard ────────────────────────────────────────────
  const copySlug = async (slug) => {
    try {
      await navigator.clipboard.writeText(slug);
      toast.success("Đã sao chép đường dẫn");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="w-full">
        {/* ── Header ── */}
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
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
              aria-label={isFilterPanelOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            >
              {isFilterPanelOpen ? "Ẩn bộ lọc" : "Bộ lọc"}
            </button>
            <Link
              to="/seller/products/create"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 transition-colors"
              aria-label="Tạo sản phẩm mới"
            >
              Tạo sản phẩm
            </Link>
            <Link
              to="/me"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
            >
              Thông tin tài khoản
            </Link>
          </div>
        </header>

        {/* ── Filter Panel ── */}
        {isFilterPanelOpen && (
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="md:col-span-2 lg:col-span-4">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-product-search"
                >
                  Tìm kiếm (tên, SKU, đường dẫn)
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <IconSearch />
                  </span>
                  <input
                    id="seller-product-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên, SKU hoặc slug..."
                    className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
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
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="all">Tất cả</option>
                  <option value="inStock">Còn hàng</option>
                  <option value="outOfStock">Hết hàng</option>
                  <option value="lowStock">Sắp hết (≤10)</option>
                </select>
              </div>

              {/* Hidden */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-hidden-filter"
                >
                  Trạng thái hiển thị
                </label>
                <select
                  id="seller-hidden-filter"
                  value={hiddenFilter}
                  onChange={(e) => setHiddenFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="all">Tất cả</option>
                  <option value="visible">Đang hiển thị</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>

              {/* Featured */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-featured-filter"
                >
                  Nổi bật
                </label>
                <select
                  id="seller-featured-filter"
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="all">Tất cả</option>
                  <option value="featured">Nổi bật</option>
                  <option value="notFeatured">Không nổi bật</option>
                </select>
              </div>

              {/* On Sale */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-sale-filter"
                >
                  Khuyến mại
                </label>
                <select
                  id="seller-sale-filter"
                  value={saleFilter}
                  onChange={(e) => setSaleFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="all">Tất cả</option>
                  <option value="onSale">Đang giảm giá</option>
                  <option value="notOnSale">Không giảm giá</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
                  htmlFor="seller-sort-by"
                >
                  Sắp xếp theo
                </label>
                <select
                  id="seller-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                >
                  <option value="default">Mặc định</option>
                  <option value="createdAt_desc">Mới nhất trước</option>
                  <option value="createdAt_asc">Cũ nhất trước</option>
                  <option value="soldCount_desc">Bán chạy nhất</option>
                  <option value="viewCount_desc">Xem nhiều nhất</option>
                </select>
              </div>

              {/* Price range */}
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
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
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
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk action bar ── */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3">
            <span className="text-sm font-semibold text-blue-800">
              Đã chọn {selectedIds.size} sản phẩm
            </span>
            <select
              value={bulkAction || ""}
              onChange={(e) => setBulkAction(e.target.value || null)}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none"
              aria-label="Chọn hành động hàng loạt"
            >
              <option value="">— Hành động hàng loạt —</option>
              <option value="hide">Ẩn tất cả</option>
              <option value="show">Hiển thị tất cả</option>
              <option value="feature">Đánh dấu nổi bật</option>
              <option value="unfeature">Bỏ nổi bật</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkSaving}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Thực hiện hành động hàng loạt"
            >
              {bulkSaving ? <Spinner /> : "Thực hiện"}
            </button>
            <button
              onClick={() => {
                setSelectedIds(new Set());
                setBulkAction(null);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-900 transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        )}

        {/* ── Loading / Empty / No Results ── */}
        {loading && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-zinc-400">
              <Spinner />
            </div>
            <p className="text-sm text-zinc-600">
              Đang tải sản phẩm của bạn...
            </p>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <p className="text-sm text-zinc-600">Bạn chưa tạo sản phẩm nào.</p>
            <Link
              to="/seller/products/create"
              className="mt-3 inline-block rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 transition-colors"
            >
              Tạo sản phẩm đầu tiên
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {/* ── Product List ── */}
        {!loading && filteredProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  aria-label="Chọn tất cả sản phẩm"
                />
                Chọn tất cả
              </label>
              <span className="text-xs text-zinc-400">
                {filteredProducts.length} sản phẩm
              </span>
            </div>

            {filteredProducts.map((product) => {
              const isEditing = editingId === product.id;
              const isSaving = savingId === product.id;
              const isImageSaving = imageSavingId === product.id;
              const selectedImage = imageFiles[product.id];
              const imagePreview = imagePreviews[product.id];
              const isHidden = product.status === "INACTIVE";
              const isExpanded = expandedId === product.id;
              const discount = discountPercent(
                Number(product?.price),
                Number(product?.salePrice),
              );
              const isSelected = selectedIds.has(product.id);
              const showToggleConfirm = toggleConfirmId === product.id;
              const isLowStock =
                Number(product?.stock || 0) > 0 &&
                Number(product?.stock || 0) <= 10;

              return (
                <article
                  key={product.id}
                  className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                    isHidden
                      ? "border-amber-300 bg-amber-50/40"
                      : isSelected
                        ? "border-blue-400 ring-1 ring-blue-200"
                        : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {/* ── View Mode ── */}
                  {!isEditing && (
                    <div className="p-5">
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="mt-1 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                          aria-label={`Chọn sản phẩm ${product.name}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                              {product?.category?.name ||
                                product?.categoryName ||
                                "Chưa có danh mục"}
                            </span>
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                                <IconStar /> Nổi bật
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-700">
                                -{discount}% giảm
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                isHidden
                                  ? "border-amber-300 bg-amber-100 text-amber-700"
                                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isHidden ? <IconEyeOff /> : <IconEye />}
                              {isHidden ? "Đã ẩn" : "Đang hiển thị"}
                            </span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-700">
                                Sắp hết hàng
                              </span>
                            )}
                          </div>

                          <h2 className="mt-1 text-lg font-semibold text-zinc-900 leading-tight">
                            {product.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image with hover preview */}
                        <div
                          className="relative w-full md:w-44 h-32 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0 cursor-pointer group"
                          onClick={() => setPreviewImage(product.imageUrl)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            setPreviewImage(product.imageUrl)
                          }
                          aria-label="Xem ảnh sản phẩm lớn"
                        >
                          {product.imageUrl ? (
                            <>
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 rounded-full px-3 py-1 transition-opacity">
                                  Xem ảnh
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500">
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
                            {product.description || "—"}
                          </p>

                          <div className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
                            <p>
                              <span className="text-zinc-500">Giá: </span>
                              <span className="font-semibold text-zinc-900">
                                {formatPrice(product.price)}
                              </span>
                            </p>
                            {discount > 0 && (
                              <p>
                                <span className="text-zinc-500">Giá KM: </span>
                                <span className="font-semibold text-rose-700">
                                  {formatPrice(product.salePrice)}
                                </span>
                              </p>
                            )}
                            <p>
                              <span className="text-zinc-500">Tồn kho: </span>
                              <span
                                className={`font-semibold ${isLowStock ? "text-orange-600" : "text-zinc-900"}`}
                              >
                                {formatNumber(product.stock)}
                              </span>
                            </p>
                            <p>
                              <span className="text-zinc-500">Đã bán: </span>
                              <span className="font-semibold text-zinc-900">
                                {formatNumber(product.soldCount)}
                              </span>
                            </p>
                            <p>
                              <span className="text-zinc-500">Lượt xem: </span>
                              <span className="font-semibold text-zinc-900">
                                {formatNumber(product.viewCount)}
                              </span>
                            </p>
                            {product.sku && (
                              <p>
                                <span className="text-zinc-500">SKU: </span>
                                <span className="font-mono font-semibold text-zinc-900">
                                  {product.sku}
                                </span>
                              </p>
                            )}
                            {product.weight != null && (
                              <p>
                                <span className="text-zinc-500">KL: </span>
                                <span className="font-semibold text-zinc-900">
                                  {Number(product.weight).toFixed(2)} kg
                                </span>
                              </p>
                            )}
                            <p>
                              <span className="text-zinc-500">ID: </span>
                              <span className="font-mono font-semibold text-zinc-900">
                                #{product.id}
                              </span>
                            </p>
                          </div>

                          {/* Collapsible details + Reviews tabs */}
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : product.id)
                              }
                              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? "Thu gọn chi tiết"
                                  : "Xem thêm chi tiết"
                              }
                            >
                              <IconChevron open={isExpanded} />
                              {isExpanded ? "Thu gọn" : "Chi tiết"}
                            </button>
                            <button
                              onClick={() => loadReviews(product.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                expandedId === product.id &&
                                reviewsMap[product.id]
                                  ? "text-blue-700 font-semibold"
                                  : "text-zinc-500 hover:text-blue-600"
                              }`}
                              aria-label={`Xem đánh giá của ${product.name}`}
                            >
                              <IconComment />
                              {loadingReviewsId === product.id
                                ? "Đang tải..."
                                : "Đánh giá"}
                              {reviewsMap[product.id]?.length > 0 &&
                                ` (${reviewsMap[product.id].length})`}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 grid gap-1.5 text-xs text-zinc-600 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                              {product.slug && (
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500">
                                    Đường dẫn:
                                  </span>
                                  <code className="text-zinc-800 text-[11px]">
                                    {product.slug}
                                  </code>
                                  <button
                                    onClick={() => copySlug(product.slug)}
                                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                    aria-label="Sao chép đường dẫn"
                                  >
                                    <IconCopy />
                                  </button>
                                </div>
                              )}
                              <p>
                                <span className="text-zinc-500">
                                  Ngày tạo:{" "}
                                </span>
                                {formatDate(product.createdAt)}
                              </p>
                              <p>
                                <span className="text-zinc-500">
                                  Cập nhật:{" "}
                                </span>
                                {formatDate(product.updatedAt)}
                              </p>
                            </div>
                          )}

                          {/* Reviews */}
                          {expandedId === product.id &&
                            reviewsMap[product.id] !== undefined && (
                              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 max-h-80 overflow-y-auto">
                                {reviewsMap[product.id].length === 0 ? (
                                  <p className="text-xs text-zinc-500 text-center py-4">
                                    Chưa có đánh giá nào cho sản phẩm này
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {reviewsMap[product.id].map(
                                      (review, rIdx) => (
                                        <div
                                          key={review.id || rIdx}
                                          className="rounded-lg border border-zinc-200 bg-white p-3"
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600">
                                              {(review.reviewerName || "U")
                                                .charAt(0)
                                                .toUpperCase()}
                                            </div>
                                            <div>
                                              <p className="text-xs font-semibold text-zinc-800">
                                                {review.reviewerName ||
                                                  "Người dùng"}
                                              </p>
                                              <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <svg
                                                    key={star}
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 20 20"
                                                    fill={
                                                      review.rating >= star
                                                        ? "currentColor"
                                                        : "none"
                                                    }
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    className={
                                                      review.rating >= star
                                                        ? "text-amber-500"
                                                        : "text-zinc-300"
                                                    }
                                                  >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                  </svg>
                                                ))}
                                                <span className="text-[11px] text-zinc-500 ml-1">
                                                  {review.createdAt
                                                    ? new Date(
                                                        review.createdAt,
                                                      ).toLocaleDateString(
                                                        "vi-VN",
                                                      )
                                                    : ""}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          {review.title && (
                                            <p className="text-xs font-semibold text-zinc-800 mt-1">
                                              {review.title}
                                            </p>
                                          )}
                                          {review.comment && (
                                            <p className="text-xs text-zinc-600 mt-0.5 line-clamp-3">
                                              {review.comment}
                                            </p>
                                          )}
                                          {review.variantAttributes && (
                                            <p className="text-[10px] text-zinc-400 mt-1">
                                              Phân loại:{" "}
                                              {Object.entries(
                                                review.variantAttributes,
                                              )
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(", ")}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
                          aria-label={`Cập nhật sản phẩm ${product.name}`}
                        >
                          Cập nhật
                        </button>

                        <a
                          href={`/products/${product.id}?sellerView=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
                          aria-label={`Xem sản phẩm ${product.name} như người mua`}
                        >
                          <IconExternal /> Xem như người mua
                        </a>

                        <input
                          id={`seller-image-${product.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(product.id, e)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`seller-image-${product.id}`}
                          className="cursor-pointer rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
                          aria-label={`Đổi ảnh sản phẩm ${product.name}`}
                        >
                          Sửa ảnh
                        </label>

                        {selectedImage && (
                          <button
                            onClick={() => handleUpdateImage(product.id)}
                            disabled={isImageSaving}
                            className="rounded-full border border-blue-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
                            aria-label={`Lưu ảnh cho ${product.name}`}
                          >
                            {isImageSaving ? (
                              <span className="flex items-center gap-1">
                                <Spinner /> Đang lưu...
                              </span>
                            ) : (
                              "Lưu ảnh"
                            )}
                          </button>
                        )}

                        {/* Toggle visibility with confirm */}
                        {!showToggleConfirm ? (
                          <button
                            onClick={() => setToggleConfirmId(product.id)}
                            disabled={isSaving}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                              isHidden
                                ? "border-emerald-300 bg-white text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50"
                                : "border-amber-300 bg-white text-amber-700 hover:border-amber-500 hover:bg-amber-50"
                            }`}
                            aria-label={
                              isHidden ? "Hiển thị sản phẩm" : "Ẩn sản phẩm"
                            }
                          >
                            {isHidden ? "Hiển thị" : "Tạm ẩn"}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-600">
                              Xác nhận?
                            </span>
                            <button
                              onClick={() =>
                                handleToggleVisibility(
                                  product.id,
                                  product.status,
                                )
                              }
                              disabled={isSaving}
                              className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                              aria-label="Xác nhận thay đổi trạng thái"
                            >
                              {isSaving ? <Spinner /> : "Có"}
                            </button>
                            <button
                              onClick={() => setToggleConfirmId(null)}
                              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-900 transition-colors"
                            >
                              Không
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Image preview */}
                      {imagePreview && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                          />
                          <div>
                            <p className="text-xs font-semibold text-zinc-800">
                              {selectedImage?.name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {(selectedImage?.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Edit Mode ── */}
                  {isEditing && (
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-4">
                        Cập nhật sản phẩm #{product.id}
                      </p>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <label className="text-sm text-zinc-700 lg:col-span-2">
                          Tên sản phẩm *
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                            aria-required="true"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Giá (VND) *
                          <input
                            type="number"
                            min="1"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                            aria-required="true"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Giá khuyến mại (VND)
                          <input
                            type="number"
                            min="0"
                            name="salePrice"
                            value={editForm.salePrice}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                          />
                          {editForm.salePrice &&
                            editForm.price &&
                            Number(editForm.salePrice) <
                              Number(editForm.price) && (
                              <p className="mt-1 text-xs text-rose-600 font-semibold">
                                Giảm{" "}
                                {discountPercent(
                                  Number(editForm.price),
                                  Number(editForm.salePrice),
                                )}
                                % so với giá gốc
                              </p>
                            )}
                          {editForm.salePrice &&
                            editForm.price &&
                            Number(editForm.salePrice) >=
                              Number(editForm.price) && (
                              <p className="mt-1 text-xs text-amber-600">
                                Giá khuyến mại phải nhỏ hơn giá gốc
                              </p>
                            )}
                        </label>

                        <label className="text-sm text-zinc-700">
                          Tồn kho
                          <input
                            type="number"
                            min="0"
                            name="stock"
                            value={editForm.stock}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Khối lượng (kg)
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="weight"
                            value={editForm.weight}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          SKU
                          <input
                            type="text"
                            name="sku"
                            value={editForm.sku}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors font-mono"
                          />
                        </label>

                        <label className="text-sm text-zinc-700">
                          Trạng thái
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors bg-white"
                          >
                            <option value="ACTIVE">Đang hiển thị</option>
                            <option value="INACTIVE">Đã ẩn</option>
                          </select>
                        </label>

                        <label className="text-sm text-zinc-700">
                          Danh mục
                          <select
                            name="categoryId"
                            value={editForm.categoryId}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors bg-white"
                          >
                            <option value="">Giữ nguyên danh mục</option>
                            {categories.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-zinc-700 pt-6">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={editForm.isFeatured}
                            onChange={handleEditChange}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                          />
                          <span className="inline-flex items-center gap-1">
                            <IconStar /> Nổi bật
                          </span>
                        </label>

                        <label className="text-sm text-zinc-700 md:col-span-2 lg:col-span-3">
                          Mô tả
                          <textarea
                            name="description"
                            rows={3}
                            value={editForm.description}
                            onChange={handleEditChange}
                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors resize-y"
                          />
                        </label>

                        {/* ── Options & Variants Editing ── */}
                        <div className="md:col-span-2 lg:col-span-3 border-t border-zinc-100 pt-4 mt-2">
                          <p className="text-sm font-semibold text-zinc-900 mb-2">
                            Biến thể sản phẩm
                          </p>

                          {/* Options definition */}
                          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 mb-3">
                            <p className="text-xs font-semibold text-zinc-700 mb-1">
                              Định nghĩa option
                            </p>
                            <p className="text-xs text-zinc-500 mb-2">
                              Tên option + giá trị (cách nhau bằng dấu phẩy).
                              VD: Màu sắc: Đỏ, Xanh
                            </p>
                            {editOptions.map((opt, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 mb-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Tên option (VD: Màu sắc)"
                                  value={opt.name}
                                  onChange={(e) =>
                                    handleEditOptionChange(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Giá trị (VD: Đỏ, Xanh)"
                                  value={opt.values}
                                  onChange={(e) =>
                                    handleEditOptionChange(
                                      idx,
                                      "values",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-[2] rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                                />
                                {editOptions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEditOption(idx)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:border-red-300 hover:text-red-600"
                                  >
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={addEditOption}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Thêm option
                              </button>
                              <button
                                type="button"
                                onClick={generateEditCombinations}
                                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Tạo biến thể
                              </button>
                            </div>
                          </div>

                          {/* Variants list */}
                          {editVariants.length > 0 && (
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 max-h-80 overflow-y-auto">
                              <p className="text-xs font-semibold text-zinc-700 mb-2">
                                Biến thể ({editVariants.length})
                              </p>
                              {editVariants.map((variant, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-zinc-200 bg-white p-3 mb-2 last:mb-0"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                      #{idx + 1} —{" "}
                                      {Object.entries(variant.attrs)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(", ") || "Chưa có thuộc tính"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeEditVariant(idx)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:border-red-300 hover:text-red-600"
                                    >
                                      <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                                    <label className="text-[11px] text-zinc-600">
                                      SKU
                                      <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) =>
                                          handleEditVariantChange(
                                            idx,
                                            "sku",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                                      />
                                    </label>
                                    <label className="text-[11px] text-zinc-600">
                                      Giá *
                                      <input
                                        type="number"
                                        min="1"
                                        value={variant.price}
                                        onChange={(e) =>
                                          handleEditVariantChange(
                                            idx,
                                            "price",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                                      />
                                    </label>
                                    <label className="text-[11px] text-zinc-600">
                                      Tồn kho *
                                      <input
                                        type="number"
                                        min="0"
                                        value={variant.stock}
                                        onChange={(e) =>
                                          handleEditVariantChange(
                                            idx,
                                            "stock",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                                      />
                                    </label>
                                    <label className="text-[11px] text-zinc-600">
                                      Giá sale
                                      <input
                                        type="number"
                                        min="0"
                                        value={variant.salePrice}
                                        onChange={(e) =>
                                          handleEditVariantChange(
                                            idx,
                                            "salePrice",
                                            e.target.value,
                                          )
                                        }
                                        className="mt-0.5 w-full rounded-lg border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-zinc-900"
                                      />
                                    </label>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={addEditVariant}
                                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Thêm biến thể
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-zinc-100">
                        <button
                          onClick={() => handleUpdate(product.id)}
                          disabled={isSaving}
                          className="rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 transition-colors flex items-center gap-1.5"
                          aria-label="Lưu cập nhật sản phẩm"
                        >
                          {isSaving ? <Spinner /> : null}
                          {isSaving ? "Đang lưu..." : "Lưu cập nhật"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
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

        {/* ── Image Lightbox ── */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => setPreviewImage(null)}
            role="dialog"
            aria-label="Xem ảnh sản phẩm"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              aria-label="Đóng ảnh xem trước"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={previewImage}
              alt="Ảnh sản phẩm"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProductsPage;
