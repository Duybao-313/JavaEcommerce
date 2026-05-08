import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/admin/ConfirmationModal";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import PaginationBar from "../../components/admin/PaginationBar";
import {
  approveReview,
  deleteReview,
  getAdminReviews,
  rejectReview,
} from "../../services/adminService";
import { formatDateTime, normalizeText, paginate } from "./adminHelpers";

const pageSize = 10;

function StatusBadge({ approved }) {
  if (approved) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
        ✓ Đã duyệt
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
      ⏳ Chờ duyệt
    </span>
  );
}

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getAdminReviews();
        if (isMounted) {
          setReviews(data || []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(err?.message || "Tải danh sách đánh giá thất bại");
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
    return reviews.filter(
      (item) =>
        !keyword ||
        normalizeText(item?.reviewerName || "").includes(keyword) ||
        normalizeText(item?.productName || "").includes(keyword) ||
        normalizeText(item?.comment || "").includes(keyword),
    );
  }, [reviews, search]);

  const pageItems = useMemo(() => paginate(filtered, page, pageSize), [filtered, page]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page]);

  async function handleApprove(reviewId) {
    setSavingId(reviewId);
    try {
      const updated = await approveReview(reviewId);
      setReviews((prev) => prev.map((item) => (item.id === reviewId ? { ...item, ...updated } : item)));
      toast.success("Đã duyệt đánh giá");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSavingId(null);
    }
  }

  async function handleReject(reviewId) {
    setSavingId(reviewId);
    try {
      const updated = await rejectReview(reviewId);
      setReviews((prev) => prev.map((item) => (item.id === reviewId ? { ...item, ...updated } : item)));
      toast.success("Đã từ chối đánh giá");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSavingId(deleteTarget.id);
    try {
      await deleteReview(deleteTarget.id);
      setReviews((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Đã xóa đánh giá");
    } catch (err) {
      toast.error(err?.message || "Lỗi");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Đánh giá sản phẩm</h1>
        <p className="mt-1 text-sm text-zinc-600">{filtered.length} đánh giá</p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Tìm theo người đánh giá, sản phẩm, nội dung..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {/* Cards View */}
      {loading ? (
        <LoadingSpinner />
      ) : pageItems.length === 0 ? (
        <div className="p-6 text-center text-sm text-zinc-600">
          {search ? "Không tìm thấy đánh giá nào" : "Chưa có đánh giá nào"}
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map((review) => (
            <div key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-900">{review.reviewerName || `#${review.reviewerId}`}</h3>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{review.productName || `Sản phẩm #${review.productId}`}</p>
                  <p className="mt-2 text-sm text-zinc-700">{review.comment || review.title || "-"}</p>
                  <p className="mt-2 text-xs text-zinc-400">{formatDateTime(review.createdAt)}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3">
                <StatusBadge approved={review.isApproved} />
                <div className="flex flex-wrap gap-2 md:ml-auto">
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={savingId === review.id || review.isApproved}
                    className="rounded px-2 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={savingId === review.id}
                    className="rounded px-2 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => setDeleteTarget(review)}
                    disabled={savingId === review.id}
                    className="rounded px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pageItems.length > 0 && (
        <PaginationBar page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Xóa đánh giá"
        message="Hành động này không thể hoàn tác. Bạn chắc chắn?"
        danger
        loading={savingId === deleteTarget?.id}
        confirmText="Xóa"
        cancelText="Hủy"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default AdminReviewsPage;



