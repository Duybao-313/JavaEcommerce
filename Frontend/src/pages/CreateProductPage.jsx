import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCategories } from "../services/categoryService";
import { createProductWithImage } from "../services/productService";
import { getAuthSession, isSellerSession } from "../services/sessionService";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  categoryName: "",
};

const emptyVariant = () => ({
  sku: "",
  attributes: { size: "" },
  price: "",
  stock: "",
  salePrice: "",
  imageUrl: "",
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

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      if (field === "size") {
        next[index] = {
          ...next[index],
          attributes: { ...next[index].attributes, size: value },
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleVariantMode = () => {
    if (!hasVariants) {
      setVariants([emptyVariant()]);
    } else {
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
      const validVariants = variants.filter((v) => v.attributes?.size?.trim());
      if (validVariants.length === 0) {
        toast.error("Vui lòng nhập ít nhất một biến thể với size");
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

      // Build variant payload
      const totalStock = validVariants.reduce(
        (sum, v) => sum + Number(v.stock),
        0,
      );
      payload.stock = totalStock;
      payload.variants = validVariants.map((v) => ({
        sku: v.sku?.trim() || null,
        attributes: { size: v.attributes.size.trim() },
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
                  Thêm size, màu sắc với giá và tồn kho riêng
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
              <div className="mt-4 space-y-3">
                {/* Variant header */}
                <div className="hidden gap-3 md:grid md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    Size
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    SKU
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    Giá
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    Tồn kho
                  </span>
                  <span className="w-10" />
                </div>

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 md:grid md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] md:items-center md:gap-3 transition-colors hover:border-zinc-300"
                  >
                    <input
                      type="text"
                      placeholder="VD: XL, L, M"
                      value={variant.attributes?.size || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "size", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />

                    <input
                      type="text"
                      placeholder="SKU (tuỳ chọn)"
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, "sku", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />

                    <input
                      type="number"
                      placeholder="Giá"
                      min="1"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />

                    <input
                      type="number"
                      placeholder="Tồn kho"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />

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
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
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
                  Thêm size mới
                </button>

                {hasVariants && variants.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Tổng tồn kho:{" "}
                    <span className="font-semibold text-zinc-900">
                      {variants.reduce(
                        (sum, v) => sum + (Number(v.stock) || 0),
                        0,
                      )}
                    </span>{" "}
                    sản phẩm (tự động tính từ các biến thể)
                  </p>
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

export default CreateProductPage;
