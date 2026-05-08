import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import PaginationBar from "../../components/admin/PaginationBar";
import { getCategories } from "../../services/categoryService";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../../services/adminService";
import { formatPrice, normalizeText, paginate } from "./adminHelpers";

const pageSize = 10;

const defaultForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  categoryName: "",
  ownerId: "",
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return products.filter(
      (item) =>
        !keyword ||
        normalizeText(item?.name || "").includes(keyword) ||
        normalizeText(item?.sellerUsername || "").includes(keyword),
    );
  }, [products, search]);

  const pageItems = useMemo(() => paginate(filtered, page, pageSize), [filtered, page]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page]);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product?.name || "",
      description: product?.description || "",
      price: String(product?.price ?? ""),
      stock: String(product?.stock ?? ""),
      categoryId: product?.categoryId ? String(product.categoryId) : "",
      categoryName: "",
      ownerId: product?.sellerId ? String(product.sellerId) : "",
    });
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      categoryName: form.categoryId ? "" : form.categoryName.trim(),
      ownerId: form.ownerId ? Number(form.ownerId) : null,
    };

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error("Tên và giá sản phẩm không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateAdminProduct(editingId, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          categoryId: payload.categoryId,
        });
        setProducts((p) =>
          p.map((item) => (item.id === editingId ? { ...item, ...updated } : item)),
        );
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description);
        formData.append("price", String(payload.price));
        formData.append("stock", String(payload.stock));
        if (payload.categoryId) {
          formData.append("categoryId", String(payload.categoryId));
        }
        if (payload.categoryName) {
          formData.append("categoryName", payload.categoryName);
        }
        if (payload.ownerId) {
          formData.append("ownerId", String(payload.ownerId));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-zinc-600">{filtered.length} sản phẩm</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(defaultForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 md:w-auto"
        >
          Tạo sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm sản phẩm, chủ sở hữu..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold text-zinc-900">
              {editingId ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tên sản phẩm"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                placeholder="Giá"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="Tồn kho"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                required
              />
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
              <input
                name="ownerId"
                type="number"
                value={form.ownerId}
                onChange={handleChange}
                placeholder="ID chủ sở hữu (tùy chọn)"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-75"
                >
                  {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-600">
            {search ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-semibold text-zinc-900">Tên</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Giá</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Stock</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Chủ sở hữu</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => (
                <tr key={product.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-zinc-600">{product.stock}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.sellerUsername || `#${product.sellerId}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="rounded px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="rounded px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pageItems.length > 0 && (
        <PaginationBar page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Xóa sản phẩm"
        message={`Bạn chắc chắn muốn xóa "${deleteTarget?.name}"?`}
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



