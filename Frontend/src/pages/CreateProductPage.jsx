import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCategories } from "../services/categoryService";
import { createProductWithImage } from "../services/productService";
import { getAuthSession, isSellerSession } from "../services/sessionService";
import { uploadImage } from "../services/uploadService";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  categoryName: "",
};

const emptyOption = () => ({ name: "", values: "" });

const emptyVariant = () => ({
  sku: "",
  attrs: {},
  price: "",
  stock: "",
  salePrice: "",
  imageUrl: "",
  imageFile: null,
  imagePreview: null,
  uploading: false,
});

function CreateProductPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getAuthSession());
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);

  const isSeller = useMemo(() => isSellerSession(session), [session]);
  const useCustomCategory = form.categoryId === "custom";

  useEffect(() => {
    const nextSession = getAuthSession();
    setSession(nextSession);

    if (!nextSession?.token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isSellerSession(nextSession)) {
      toast.error("Chỉ seller mới có quyền tạo sản phẩm");
      navigate("/products", { replace: true });
      return;
    }

    let cancelled = false;
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const items = await getCategories();
        if (!cancelled) setCategories(items);
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || "Không thể tải danh mục");
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  // --- Option management ---
  const handleOptionChange = (index, field, value) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, emptyOption()]);
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate combinations from defined options
  const generateCombinations = () => {
    // Parse options: each option has name + comma-separated values
    const parsed = options
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

    // Generate cartesian product
    const combinations = cartesianProduct(parsed.map((o) => o.values));

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
        imageFile: null,
        imagePreview: null,
        uploading: false,
      };
    });

    setVariants(generated);
    toast.success(`Đã tạo ${generated.length} biến thể từ các option`);
  };

  // --- Variant management ---
  const handleVariantChange = (variantIndex, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex] = { ...next[variantIndex], [field]: value };
      return next;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantImageChange = async (variantIndex, file) => {
    if (!file) {
      setVariants((prev) => {
        const next = [...prev];
        next[variantIndex] = {
          ...next[variantIndex],
          imageFile: null,
          imagePreview: null,
          imageUrl: "",
        };
        return next;
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setVariants((prev) => {
      const next = [...prev];
      next[variantIndex] = {
        ...next[variantIndex],
        imageFile: file,
        imagePreview: preview,
        uploading: true,
      };
      return next;
    });

    try {
      const imageUrl = await uploadImage(file);
      setVariants((prev) => {
        const next = [...prev];
        next[variantIndex] = {
          ...next[variantIndex],
          imageUrl,
          uploading: false,
        };
        return next;
      });
    } catch (err) {
      toast.error(err?.message || "Không thể tải ảnh biến thể");
      setVariants((prev) => {
        const next = [...prev];
        next[variantIndex] = {
          ...next[variantIndex],
          imageFile: null,
          imagePreview: null,
          imageUrl: "",
          uploading: false,
        };
        return next;
      });
    }
  };

  const toggleVariantMode = () => {
    if (!hasVariants) {
      setOptions([emptyOption()]);
      setVariants([]);
    } else {
      setOptions([]);
      setVariants([]);
    }
    setHasVariants((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: useCustomCategory ? null : Number(form.categoryId || 0),
      categoryName: useCustomCategory ? form.categoryName.trim() : "",
    };

    if (
      !payload.name ||
      !Number.isFinite(payload.price) ||
      payload.price <= 0
    ) {
      toast.error("Vui lòng nhập đúng tên và giá");
      return;
    }

    if (!useCustomCategory && !payload.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    if (useCustomCategory && !payload.categoryName) {
      toast.error("Vui lòng nhập tên danh mục mới");
      return;
    }

    // Validate variants
    if (hasVariants) {
      // Build options payload for server validation
      const parsedOptions = options
        .map((o) => ({
          name: o.name.trim(),
          values: o.values
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
          required: true,
        }))
        .filter((o) => o.name && o.values.length > 0);

      const validVariants = variants.filter(
        (v) => v.attrs && Object.keys(v.attrs).length > 0,
      );

      if (validVariants.length === 0) {
        toast.error("Vui lòng tạo ít nhất một biến thể");
        return;
      }

      for (const v of validVariants) {
        if (!Number.isFinite(Number(v.price)) || Number(v.price) <= 0) {
          toast.error("Mỗi biến thể cần có giá hợp lệ > 0");
          return;
        }
        if (!Number.isFinite(Number(v.stock)) || Number(v.stock) < 0) {
          toast.error("Mỗi biến thể cần có tồn kho >= 0");
          return;
        }
      }

      const totalStock = validVariants.reduce(
        (sum, v) => sum + Number(v.stock),
        0,
      );
      payload.stock = totalStock;
      payload.options = parsedOptions;
      payload.variants = validVariants.map((v) => ({
        sku: v.sku?.trim() || null,
        attributes: v.attrs,
        price: Number(v.price),
        stock: Number(v.stock),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        imageUrl: v.imageUrl?.trim() || null,
      }));
    } else {
      if (!Number.isFinite(payload.stock) || payload.stock < 0) {
        toast.error("Vui lòng nhập tồn kho hợp lệ");
        return;
      }
    }

    setSubmitting(true);
    try {
      await createProductWithImage(payload, imageFile);
      toast.success("Tạo sản phẩm thành công");
      navigate("/seller/products");
    } catch (err) {
      toast.error(err?.message || "Không thể tạo sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session?.token || !isSeller) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f4f4ef_45%,#ffffff_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              SplitGo Seller
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Tạo sản phẩm mới
            </h1>
          </div>
          <Link
            to="/seller/products"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 hover:border-zinc-900 transition-colors"
          >
            Quay lại sản phẩm
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          {/* Basic fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-700">
              Tên sản phẩm
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
              />
            </label>

            <label className="text-sm text-zinc-700">
              Giá (VND)
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
              />
            </label>

            {!hasVariants && (
              <label className="text-sm text-zinc-700">
                Tồn kho
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                />
              </label>
            )}

            <label className="text-sm text-zinc-700">
              Danh mục
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={loadingCategories}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors bg-white"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
                <option value="custom">Tự nhập danh mục mới</option>
              </select>
            </label>

            {useCustomCategory && (
              <label className="text-sm text-zinc-700 md:col-span-2">
                Danh mục mới
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors"
                />
              </label>
            )}
          </div>

          <label className="mt-4 block text-sm text-zinc-700">
            Mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 transition-colors resize-y"
            />
          </label>

          <label className="mt-4 block text-sm text-zinc-700">
            Ảnh sản phẩm
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none"
            />
          </label>

          {/* Variant Toggle */}
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Biến thể sản phẩm
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Định nghĩa các option (màu sắc, size...) để tạo biến thể với
                  giá và tồn kho riêng
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVariantMode}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  hasVariants
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-900"
                }`}
              >
                {hasVariants ? "Tắt biến thể" : "Thêm biến thể"}
              </button>
            </div>

            {hasVariants && (
              <div className="mt-4 space-y-4">
                {/* === STEP 1: Define Option Types === */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                  <p className="text-sm font-semibold text-zinc-900 mb-1">
                    Bước 1: Định nghĩa các option
                  </p>
                  <p className="text-xs text-zinc-500 mb-3">
                    Mỗi option có một tên (VD: Màu sắc) và các giá trị, cách
                    nhau bằng dấu phẩy (VD: Đỏ, Xanh, Vàng)
                  </p>
                  <div className="space-y-2">
                    {options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tên option (VD: Màu sắc)"
                          value={opt.name}
                          onChange={(e) =>
                            handleOptionChange(index, "name", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Giá trị (VD: Đỏ, Xanh, Vàng)"
                          value={opt.values}
                          onChange={(e) =>
                            handleOptionChange(index, "values", e.target.value)
                          }
                          className="flex-[2] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:border-red-300 hover:text-red-600 transition-colors"
                            title="Xoá option"
                          >
                            <svg
                              width="12"
                              height="12"
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
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
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
                      Thêm option
                    </button>
                    <button
                      type="button"
                      onClick={generateCombinations}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Tạo biến thể từ option
                    </button>
                  </div>
                </div>

                {/* === STEP 2: Variants Table === */}
                {variants.length > 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/30 p-4">
                    <p className="text-sm font-semibold text-zinc-900 mb-1">
                      Bước 2: Chỉnh sửa biến thể
                    </p>
                    <p className="text-xs text-zinc-500 mb-3">
                      Nhập SKU, giá, tồn kho cho từng biến thể
                    </p>
                    <div className="space-y-3">
                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                              Biến thể #{index + 1}
                              {" — "}
                              {Object.entries(variant.attrs)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:border-red-300 hover:text-red-600 transition-colors"
                              title="Xoá biến thể"
                            >
                              <svg
                                width="14"
                                height="14"
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
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="text-xs text-zinc-600">
                              SKU (tuỳ chọn)
                              <input
                                type="text"
                                placeholder="VD: TSHIRT-RED-XL"
                                value={variant.sku}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "sku",
                                    e.target.value,
                                  )
                                }
                                className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                              />
                            </label>

                            <label className="text-xs text-zinc-600">
                              Giá (VND) *
                              <input
                                type="number"
                                placeholder="Giá"
                                min="1"
                                value={variant.price}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                              />
                            </label>

                            <label className="text-xs text-zinc-600">
                              Tồn kho *
                              <input
                                type="number"
                                placeholder="Tồn kho"
                                min="0"
                                value={variant.stock}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "stock",
                                    e.target.value,
                                  )
                                }
                                className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                              />
                            </label>

                            <label className="text-xs text-zinc-600">
                              Giá sale (tuỳ chọn)
                              <input
                                type="number"
                                placeholder="Giá sale"
                                min="0"
                                value={variant.salePrice}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "salePrice",
                                    e.target.value,
                                  )
                                }
                                className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                              />
                            </label>
                          </div>

                          {/* Variant image upload */}
                          <div className="mt-3">
                            <p className="text-xs font-medium text-zinc-500 mb-1.5">
                              Ảnh biến thể (tuỳ chọn)
                            </p>
                            <div className="flex items-start gap-3">
                              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                                {variant.uploading
                                  ? "Đang tải..."
                                  : variant.imageUrl
                                    ? "Đổi ảnh"
                                    : "Chọn ảnh"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleVariantImageChange(
                                      index,
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                />
                              </label>

                              {variant.imagePreview && (
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200">
                                  <img
                                    src={variant.imagePreview}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                  />
                                  {variant.uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                      <svg
                                        className="h-5 w-5 animate-spin text-zinc-600"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                      >
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          className="opacity-25"
                                        />
                                        <path
                                          d="M4 12a8 8 0 018-8"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          className="opacity-75"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                  {variant.imageUrl && !variant.uploading && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 py-0.5 text-center text-[10px] text-white">
                                      ✓ Đã tải
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addVariant}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Thêm biến thể mới
                    </button>

                    <p className="mt-2 text-xs text-zinc-500">
                      Tổng tồn kho:{" "}
                      <span className="font-semibold text-zinc-900">
                        {variants.reduce(
                          (sum, v) => sum + (Number(v.stock) || 0),
                          0,
                        )}
                      </span>{" "}
                      sản phẩm (tự động tính từ các biến thể)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
          >
            {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Generate cartesian product of arrays.
 * e.g., cartesianProduct([["red","blue"], ["M","L"]]) → [["red","M"],["red","L"],["blue","M"],["blue","L"]]
 */
function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]],
  );
}

export default CreateProductPage;
