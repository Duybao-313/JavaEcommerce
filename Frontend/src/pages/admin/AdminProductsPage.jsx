import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaginationBar from "../../components/admin/PaginationBar";
import { getCategories } from "../../services/categoryService";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  updateProductStatus,
} from "../../services/adminService";
import {
  formatPrice,
  normalizeText,
  paginate,
  formatDateTime,
} from "./adminHelpers";

const pageSize = 10;

const STATUS_MAP = {
  ACTIVE: {
    label: "Kích hoạt",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  INACTIVE: {
    label: "Tạm khóa",
    cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  DRAFT: { label: "Nháp", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  OUT_OF_STOCK: {
    label: "Hết hàng",
    cls: "bg-red-100 text-red-800 border-red-200",
  },
};

const TABS = [
  { key: "basic", label: "Thông tin cơ bản" },
  { key: "pricing", label: "Giá & Kho" },
  { key: "variants", label: "Biến thể" },
  { key: "options", label: "Tùy chọn" },
];

const defaultForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  salePrice: "",
  sku: "",
  weight: "",
  isFeatured: false,
  status: "ACTIVE",
  imageUrl: "",
  categoryId: "",
  categoryName: "",
  ownerId: "",
};

const emptyVariant = () => ({
  id: null,
  sku: "",
  attributes: {},
  price: "",
  salePrice: "",
  stock: "",
  imageUrl: "",
  weight: "",
});

const emptyOption = () => ({
  name: "",
  valuesText: "",
  required: true,
});

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [variants, setVariants] = useState([]);
  const [optionDefs, setOptionDefs] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [variantExpanded, setVariantExpanded] = useState(null);

  // --- Data loading ---
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const [data, cats] = await Promise.all([
          getAdminProducts(),
          getCategories().catch(() => []),
        ]);
        if (isMounted) {
          setProducts(data || []);
          setCategories(cats || []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err?.message || "Tải danh sách sản phẩm thất bại");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Filtering ---
  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return products.filter((item) => {
      const matchKeyword =
        !keyword ||
        normalizeText(item?.name || "").includes(keyword) ||
        normalizeText(item?.sellerUsername || "").includes(keyword) ||
        normalizeText(item?.sku || "").includes(keyword) ||
        normalizeText(item?.categoryName || "").includes(keyword);
      const matchStatus = !statusFilter || item?.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [products, search, statusFilter]);

  const pageItems = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page],
  );

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, page]);

  // --- Derive options from variants ---
  const deriveOptionsFromVariants = useCallback((variantList) => {
    if (!variantList || variantList.length === 0) return [];
    const keySet = new Set();
    const keyValues = {};
    variantList.forEach((v) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((k) => {
        keySet.add(k);
        if (!keyValues[k]) keyValues[k] = new Set();
        keyValues[k].add(attrs[k]);
      });
    });
    return [...keySet].map((k) => ({
      name: k,
      valuesText: [...(keyValues[k] || [])].join(", "),
      required: true,
    }));
  }, []);

  // --- Form helpers ---
  function resetForm() {
    setForm(defaultForm);
    setVariants([]);
    setOptionDefs([]);
    setEditingId(null);
    setShowForm(false);
    setActiveTab("basic");
    setVariantExpanded(null);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price != null ? String(product.price) : "",
      stock: product?.stock != null ? String(product.stock) : "",
      salePrice: product?.salePrice != null ? String(product.salePrice) : "",
      sku: product?.sku || "",
      weight: product?.weight != null ? String(product.weight) : "",
      isFeatured: product?.isFeatured || false,
      status: product?.status || "ACTIVE",
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId ? String(product.categoryId) : "",
      categoryName: "",
      ownerId: product?.sellerId ? String(product.sellerId) : "",
    });
    const existingVariants = (product?.variants || []).map((v) => ({
      id: v.id || null,
      sku: v.sku || "",
      attributes: v.attributes || {},
      price: v.price != null ? String(v.price) : "",
      salePrice: v.salePrice != null ? String(v.salePrice) : "",
      stock: v.stock != null ? String(v.stock) : "",
      imageUrl: v.imageUrl || "",
      weight: v.weight != null ? String(v.weight) : "",
    }));
    setVariants(existingVariants);
    setOptionDefs(deriveOptionsFromVariants(product?.variants || []));
    setShowForm(true);
    setActiveTab("basic");
    setVariantExpanded(null);
  }

  function startCreate() {
    setForm(defaultForm);
    setVariants([]);
    setOptionDefs([]);
    setEditingId(null);
    setShowForm(true);
    setActiveTab("basic");
    setVariantExpanded(null);
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  // --- Variant helpers ---
  function handleVariantChange(index, field, value) {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function handleVariantAttrChange(index, key, value) {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        attributes: { ...next[index].attributes, [key]: value || "" },
      };
      return next;
    });
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
    setVariantExpanded(variants.length);
  }

  function removeVariant(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    if (variantExpanded === index) setVariantExpanded(null);
    else if (variantExpanded > index) setVariantExpanded(variantExpanded - 1);
  }

  function toggleVariantExpand(idx) {
    setVariantExpanded((prev) => (prev === idx ? null : idx));
  }

  function applyOptionsToVariants() {
    const keys = optionDefs
      .filter((o) => o.name.trim())
      .map((o) => o.name.trim());
    if (keys.length === 0) {
      toast.error("Vui lòng định nghĩa ít nhất một tùy chọn");
      return;
    }
    const allValues = optionDefs
      .filter((o) => o.name.trim())
      .map((o) => ({
        key: o.name.trim(),
        values: o.valuesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
    const emptyValues = allValues.filter((a) => a.values.length === 0);
    if (emptyValues.length > 0) {
      toast.error(`Tùy chọn "${emptyValues[0].key}" chưa có giá trị`);
      return;
    }
    // Build cartesian product
    function cartesian(arrays) {
      return arrays.reduce(
        (acc, curr) =>
          acc.flatMap((a) =>
            curr.map((c) => ({ ...a, [curr[0]?.__key || ""]: c })),
          ),
        [{}],
      );
    }
    const arrays = allValues.map((a) => a.values.map((v) => v));
    // Tag the key so cartesian can use it
    const tagged = allValues.map((a) => {
      const vals = a.values.map((v) => v);
      vals.__key = a.key;
      return vals;
    });
    // Actually simpler: just manually compute
    const generate = (opts) => {
      if (opts.length === 0) return [{}];
      const [first, ...rest] = opts;
      const sub = generate(rest);
      const result = [];
      for (const val of first.values) {
        for (const s of sub) {
          result.push({ [first.key]: val, ...s });
        }
      }
      return result;
    };
    const combos = generate(allValues);
    const newVariants = combos.map((attrs) => ({
      id: null,
      sku: "",
      attributes: attrs,
      price: "",
      salePrice: "",
      stock: "",
      imageUrl: "",
      weight: "",
    }));
    setVariants(newVariants);
    setVariantExpanded(null);
    toast.success(`Đã tạo ${newVariants.length} biến thể`);
  }

  // --- Option helpers ---
  function handleOptionChange(index, field, value) {
    setOptionDefs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addOption() {
    setOptionDefs((prev) => [...prev, emptyOption()]);
  }

  function removeOption(index) {
    setOptionDefs((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Submit ---
  async function handleSubmit(e) {
    e.preventDefault();

    const hasVariants = variants.length > 0;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price ? Number(form.price) : null,
      stock: form.stock ? Number(form.stock) : 0,
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      sku: hasVariants ? null : form.sku.trim() || null,
      weight: form.weight ? Number(form.weight) : null,
      isFeatured: form.isFeatured,
      status: form.status,
      imageUrl: form.imageUrl?.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      categoryName: form.categoryId ? "" : form.categoryName.trim(),
      ownerId: form.ownerId ? Number(form.ownerId) : null,
    };

    if (!payload.name) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    if (!editingId && (!payload.price || payload.price <= 0)) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    // Build variant payload
    let variantPayload = null;
    if (hasVariants) {
      const invalidVariant = variants.find(
        (v) =>
          !v.price || Number(v.price) <= 0 || !v.stock || Number(v.stock) < 0,
      );
      if (invalidVariant) {
        toast.error("Mỗi biến thể cần có giá > 0 và tồn kho >= 0");
        return;
      }
      variantPayload = variants.map((v) => ({
        sku: v.sku?.trim() || null,
        attributes: v.attributes || {},
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        stock: Number(v.stock),
        imageUrl: v.imageUrl?.trim() || null,
        weight: v.weight ? Number(v.weight) : null,
      }));
    }

    setSaving(true);
    try {
      if (editingId) {
        const updateBody = { ...payload };
        delete updateBody.ownerId;
        delete updateBody.categoryName;
        delete updateBody.imageUrl;
        if (variantPayload) {
          updateBody.variants = variantPayload;
        }
        const updated = await updateAdminProduct(editingId, updateBody);
        setProducts((p) =>
          p.map((item) =>
            item.id === editingId ? { ...item, ...updated } : item,
          ),
        );
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description || "");
        formData.append("price", String(payload.price));
        formData.append("stock", String(payload.stock ?? 0));
        if (payload.categoryId)
          formData.append("categoryId", String(payload.categoryId));
        if (payload.categoryName)
          formData.append("categoryName", payload.categoryName);
        if (payload.ownerId)
          formData.append("ownerId", String(payload.ownerId));
        if (payload.salePrice)
          formData.append("salePrice", String(payload.salePrice));
        if (payload.weight) formData.append("weight", String(payload.weight));
        if (payload.sku) formData.append("sku", payload.sku);
        if (payload.isFeatured != null)
          formData.append("isFeatured", String(payload.isFeatured));
        if (payload.imageUrl) formData.append("imageUrl", payload.imageUrl);

        if (variantPayload && variantPayload.length > 0) {
          formData.append("variants", JSON.stringify(variantPayload));
        }

        const created = await createAdminProduct(formData);
        setProducts((p) => [created, ...p]);
        toast.success("Tạo sản phẩm thành công");
      }
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteAdminProduct(deleteTarget.id);
      setProducts((p) => p.filter((item) => item.id !== deleteTarget.id));
      toast.success("Xóa sản phẩm thành công");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  // Quick status toggle
  async function handleStatusToggle(product, newStatus) {
    if (product.status === newStatus) return;
    const prevProducts = [...products];
    setProducts((p) =>
      p.map((item) =>
        item.id === product.id ? { ...item, status: newStatus } : item,
      ),
    );
    try {
      await updateProductStatus(product.id, newStatus);
      toast.success(
        `Trạng thái → ${STATUS_MAP[newStatus]?.label || newStatus}`,
      );
    } catch (err) {
      setProducts(prevProducts);
      toast.error(err?.message || "Cập nhật trạng thái thất bại");
    }
  }

  // Safe seller display name
  function sellerDisplay(product) {
    const name = product?.sellerUsername;
    if (!name || name === "undefined" || name === "null") {
      return product?.sellerId ? `#${product.sellerId}` : "—";
    }
    return name;
  }

  // --- Status badge with quick toggle ---
  function StatusBadge({ status, stock, product, onToggle }) {
    const displayStatus =
      stock === 0 && status === "ACTIVE" ? "OUT_OF_STOCK" : status;
    const cfg = STATUS_MAP[displayStatus] || STATUS_MAP.INACTIVE;

    if (!onToggle || !product) {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cfg.cls}`}
        >
          {cfg.label}
        </span>
      );
    }

    const nextStatuses =
      status === "ACTIVE"
        ? ["INACTIVE", "DRAFT"]
        : status === "INACTIVE"
          ? ["ACTIVE", "DRAFT"]
          : status === "DRAFT"
            ? ["ACTIVE", "INACTIVE"]
            : ["ACTIVE"];

    return (
      <div className="relative inline-block group/status">
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${cfg.cls}`}
          title="Nhấn để đổi trạng thái"
        >
          {cfg.label}
          <svg
            className="h-2.5 w-2.5 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover/status:block">
          <div className="rounded-lg border border-zinc-200 bg-white py-1 shadow-lg min-w-[110px]">
            {nextStatuses.map((ns) => {
              const nc = STATUS_MAP[ns] || STATUS_MAP.INACTIVE;
              return (
                <button
                  key={ns}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(product, ns);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-[11px] font-semibold hover:bg-zinc-50 transition-colors ${nc.cls.replace(/bg-\S+/g, "").replace(/border-\S+/g, "")}`}
                >
                  {nc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Price display with sale comparison ---
  function PriceCell({ price, salePrice }) {
    if (salePrice != null && salePrice > 0 && salePrice < price) {
      const discount = Math.round(((price - salePrice) / price) * 100);
      return (
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400 line-through">
            {formatPrice(price)}
          </span>
          <span className="font-semibold text-zinc-900">
            {formatPrice(salePrice)}
            <span className="ml-1 text-[11px] font-medium text-emerald-700">
              -{discount}%
            </span>
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium text-zinc-900">{formatPrice(price)}</span>
    );
  }

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {filtered.length} sản phẩm
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors md:w-auto"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo sản phẩm
        </button>
      </div>

      {/* ═══════════ SEARCH & FILTER BAR ═══════════ */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên, SKU, danh mục, chủ sở hữu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-4 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors md:w-44"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Kích hoạt</option>
          <option value="INACTIVE">Tạm khóa</option>
          <option value="DRAFT">Nháp</option>
        </select>
      </div>

      {/* ═══════════ EDIT MODAL (4 TABS) ═══════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-bold text-zinc-900">
                {editingId ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                aria-label="Đóng"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-zinc-200 px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSubmit} className="px-6 py-5">
              {/* ── TAB 1: BASIC INFO ── */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Tên sản phẩm *
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Nhập tên sản phẩm"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Mô tả chi tiết sản phẩm"
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Danh mục
                      </label>
                      <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleFormChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Trạng thái
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                      >
                        <option value="ACTIVE">Kích hoạt</option>
                        <option value="INACTIVE">Tạm khóa</option>
                        <option value="DRAFT">Nháp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        SKU
                      </label>
                      <input
                        name="sku"
                        value={form.sku}
                        onChange={handleFormChange}
                        placeholder="Mã SKU"
                        disabled={variants.length > 0}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-400"
                      />
                      {variants.length > 0 && (
                        <p className="mt-1 text-[11px] text-zinc-400">
                          SKU được quản lý theo từng biến thể
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Cân nặng (kg)
                      </label>
                      <input
                        name="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.weight}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        URL ảnh
                      </label>
                      <input
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleFormChange}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={form.isFeatured}
                        onChange={handleFormChange}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                      <label
                        htmlFor="isFeatured"
                        className="text-sm font-medium text-zinc-700 select-none"
                      >
                        ⭐ Sản phẩm nổi bật
                      </label>
                    </div>
                    {!editingId && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                          ID chủ sở hữu
                        </label>
                        <input
                          name="ownerId"
                          type="number"
                          value={form.ownerId}
                          onChange={handleFormChange}
                          placeholder="Tùy chọn"
                          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 2: PRICING & STOCK ── */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Giá gốc *
                      </label>
                      <input
                        name="price"
                        type="number"
                        min="1"
                        value={form.price}
                        onChange={handleFormChange}
                        placeholder="0"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                        required={!editingId}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Giá khuyến mãi
                      </label>
                      <input
                        name="salePrice"
                        type="number"
                        min="0"
                        value={form.salePrice}
                        onChange={handleFormChange}
                        placeholder="Để trống nếu không KM"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                      />
                      {form.price &&
                        form.salePrice &&
                        Number(form.salePrice) > 0 &&
                        Number(form.salePrice) < Number(form.price) && (
                          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                            Giảm{" "}
                            {Math.round(
                              ((Number(form.price) - Number(form.salePrice)) /
                                Number(form.price)) *
                                100,
                            )}
                            %
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-1.5">
                        Tồn kho *
                      </label>
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={handleFormChange}
                        placeholder="0"
                        disabled={variants.length > 0}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none transition-colors disabled:bg-zinc-100 disabled:text-zinc-400"
                      />
                      {variants.length > 0 && (
                        <p className="mt-1 text-[11px] text-zinc-400">
                          Tự động = tổng tồn kho biến thể (
                          {variants.reduce(
                            (s, v) => s + (Number(v.stock) || 0),
                            0,
                          )}
                          )
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: VARIANTS ── */}
              {activeTab === "variants" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-600">
                      {variants.length === 0
                        ? "Chưa có biến thể nào"
                        : `${variants.length} biến thể`}
                    </p>
                    <div className="flex gap-2">
                      {optionDefs.length > 0 && (
                        <button
                          type="button"
                          onClick={applyOptionsToVariants}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                          🔄 Tạo từ tùy chọn
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                      >
                        + Thêm biến thể
                      </button>
                    </div>
                  </div>

                  {variants.map((variant, idx) => {
                    const attrSummary =
                      Object.entries(variant.attributes || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ") || "Chưa có thuộc tính";
                    const isExpanded = variantExpanded === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-200 bg-white"
                      >
                        {/* Variant header */}
                        <button
                          type="button"
                          onClick={() => toggleVariantExpand(idx)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="text-sm font-medium text-zinc-900">
                                {attrSummary}
                              </span>
                              {variant.price && (
                                <span className="ml-2 text-xs text-zinc-500">
                                  {formatPrice(Number(variant.price))}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className={`h-4 w-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {/* Variant details */}
                        {isExpanded && (
                          <div className="border-t border-zinc-200 px-4 py-4 space-y-3 bg-zinc-50/50">
                            {/* Attributes from option definitions */}
                            {optionDefs.filter((o) => o.name.trim()).length >
                              0 && (
                              <div className="grid gap-3 md:grid-cols-2">
                                {optionDefs
                                  .filter((o) => o.name.trim())
                                  .map((opt) => (
                                    <div key={opt.name}>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                        {opt.name}
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          variant.attributes?.[
                                            opt.name.trim()
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleVariantAttrChange(
                                            idx,
                                            opt.name.trim(),
                                            e.target.value,
                                          )
                                        }
                                        placeholder={`Giá trị ${opt.name}`}
                                        className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                      />
                                    </div>
                                  ))}
                              </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-3">
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  SKU
                                </label>
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "sku",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="SKU"
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  Giá *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={variant.price}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  Tồn kho *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "stock",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  Giá KM
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.salePrice}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "salePrice",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tùy chọn"
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  Cân nặng (kg)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.weight}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "weight",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                                  URL ảnh
                                </label>
                                <input
                                  type="text"
                                  value={variant.imageUrl}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      "imageUrl",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://..."
                                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                            >
                              ✕ Xóa biến thể này
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── TAB 4: OPTIONS ── */}
              {activeTab === "options" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-600">
                      Định nghĩa các loại tùy chọn (vd: Màu sắc, Kích thước...)
                    </p>
                    <button
                      type="button"
                      onClick={addOption}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                    >
                      + Thêm tùy chọn
                    </button>
                  </div>

                  {optionDefs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
                      Chưa có tùy chọn nào. Thêm tùy chọn để tạo biến thể tự
                      động.
                    </div>
                  )}

                  {optionDefs.map((opt, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-200 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] items-end">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                            Tên tùy chọn
                          </label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) =>
                              handleOptionChange(idx, "name", e.target.value)
                            }
                            placeholder="vd: Màu sắc"
                            className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1">
                            Giá trị (cách nhau bởi dấu phẩy)
                          </label>
                          <input
                            type="text"
                            value={opt.valuesText}
                            onChange={(e) =>
                              handleOptionChange(
                                idx,
                                "valuesText",
                                e.target.value,
                              )
                            }
                            placeholder="vd: Đỏ, Xanh, Vàng, Đen"
                            className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-zinc-900 focus:outline-none transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}

                  {optionDefs.length > 0 && (
                    <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                      <p className="text-xs text-zinc-500">
                        💡 Sau khi định nghĩa tùy chọn, vào tab{" "}
                        <strong>Biến thể</strong> và bấm{" "}
                        <strong>"Tạo từ tùy chọn"</strong> để tự động sinh tất
                        cả tổ hợp biến thể.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── FORM ACTIONS ── */}
              <div className="mt-6 flex gap-3 border-t border-zinc-200 pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 transition-colors"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Cập nhật"
                      : "Tạo sản phẩm"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ TABLE ═══════════ */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-10 w-10 text-zinc-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-sm font-medium text-zinc-500">
              {search || statusFilter
                ? "Không tìm thấy sản phẩm nào"
                : "Chưa có sản phẩm nào"}
            </p>
            {!search && !statusFilter && (
              <button
                type="button"
                onClick={startCreate}
                className="mt-3 text-sm font-semibold text-zinc-900 hover:underline"
              >
                Tạo sản phẩm đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Ảnh
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Tên / SKU
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Giá
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Kho
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Trạng thái
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    NB
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Seller
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    DM
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500 text-right">
                    Xem
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500 text-right">
                    Bán
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Ngày tạo
                  </th>
                  <th className="sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors group"
                  >
                    <td className="px-3 py-2.5">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-9 w-9 rounded-md border border-zinc-200 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="max-w-[180px]">
                        <Link
                          to={`/products/${product.id}?adminPreview=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-zinc-900 truncate hover:text-blue-700 hover:underline transition-colors"
                          title="Xem như người mua (tab mới)"
                        >
                          {product.isFeatured && (
                            <span
                              className="mr-1 text-amber-500"
                              title="Nổi bật"
                            >
                              ⭐
                            </span>
                          )}
                          {product.name}
                        </Link>
                        {product.sku && (
                          <p className="text-[11px] text-zinc-400 truncate font-mono">
                            {product.sku}
                          </p>
                        )}
                        {product.variants?.length > 0 && (
                          <span className="inline-block mt-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {product.variants.length} biến thể
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <PriceCell
                        price={product.price}
                        salePrice={product.salePrice}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-semibold ${product.stock === 0 ? "text-red-600" : "text-zinc-900"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        status={product.status}
                        stock={product.stock}
                        product={product}
                        onToggle={handleStatusToggle}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      {product.isFeatured ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          NB
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-600 text-xs max-w-[100px] truncate">
                      {sellerDisplay(product)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-zinc-500 max-w-[100px] truncate">
                      {product.categoryName || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-zinc-500 tabular-nums">
                      {product.viewCount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-zinc-500 tabular-nums">
                      {product.soldCount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-zinc-400 whitespace-nowrap">
                      {formatDateTime(product.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                          aria-label="Sửa sản phẩm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-zinc-100">
              {pageItems.map((product) => (
                <div key={product.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-start gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-md border border-zinc-200 object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {product.isFeatured && (
                          <span className="text-amber-500 text-xs">⭐</span>
                        )}
                        <Link
                          to={`/products/${product.id}?adminPreview=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm text-zinc-900 truncate hover:text-blue-700 hover:underline transition-colors"
                          title="Xem như người mua (tab mới)"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <PriceCell
                          price={product.price}
                          salePrice={product.salePrice}
                        />
                        <StatusBadge
                          status={product.status}
                          stock={product.stock}
                          product={product}
                          onToggle={handleStatusToggle}
                        />
                        {product.variants?.length > 0 && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {product.variants.length} BT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      Kho:{" "}
                      <strong
                        className={
                          product.stock === 0 ? "text-red-600" : "text-zinc-900"
                        }
                      >
                        {product.stock}
                      </strong>
                    </span>
                    <span>{sellerDisplay(product)}</span>
                    <span>{product.categoryName || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>👁 {product.viewCount?.toLocaleString() || "0"}</span>
                    <span>💰 {product.soldCount?.toLocaleString() || "0"}</span>
                    <span>{formatDateTime(product.createdAt)}</span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-zinc-100">
                    <button
                      onClick={() => startEdit(product)}
                      className="flex-1 rounded-md border border-zinc-300 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="flex-1 rounded-md border border-red-200 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══════════ PAGINATION ═══════════ */}
      {!loading && pageItems.length > 0 && (
        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}

      {/* ═══════════ DELETE CONFIRMATION ═══════════ */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Xóa sản phẩm"
        message={`Bạn chắc chắn muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        danger
        loading={saving}
        confirmText="Xóa"
        cancelText="Hủy"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default AdminProductsPage;
