import React from "react";
import ProductReviewRow from "./ProductReviewRow";

/**
 * Skeleton loading state for review list.
 */
function ReviewSkeleton() {
  return (
    <div className="review-skeleton" aria-label="Đang tải danh sách sản phẩm">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="review-skeleton__row">
          <div className="review-skeleton__cell review-skeleton__cell--thumb" />
          <div className="review-skeleton__cell" style={{ width: "70%" }} />
          <div className="review-skeleton__cell" />
          <div className="review-skeleton__cell" />
          <div className="review-skeleton__cell" />
          <div className="review-skeleton__cell" />
          <div className="review-skeleton__cell" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no products match filters.
 */
function EmptyState({ activeTab }) {
  const messages = {
    ALL: {
      title: "Chưa có sản phẩm nào",
      desc: "Sản phẩm do seller tạo sẽ xuất hiện tại đây để bạn duyệt.",
    },
    PENDING_REVIEW: {
      title: "Không có sản phẩm chờ duyệt",
      desc: "Tất cả sản phẩm đã được xử lý. Hãy kiểm tra lại sau.",
    },
    REJECTED: {
      title: "Không có sản phẩm bị từ chối",
      desc: "Chưa có sản phẩm nào bị từ chối duyệt.",
    },
    PENDING_CHANGES: {
      title: "Không có sản phẩm cần chỉnh sửa",
      desc: "Chưa có yêu cầu chỉnh sửa nào đang chờ seller.",
    },
    ACTIVE: {
      title: "Không có sản phẩm đã duyệt",
      desc: "Chưa có sản phẩm nào được duyệt trong bộ lọc này.",
    },
    INACTIVE: {
      title: "Không có sản phẩm bị khóa",
      desc: "Chưa có sản phẩm nào bị khóa / xóa mềm.",
    },
  };
  const msg = messages[activeTab] || messages.ALL;

  return (
    <div className="review-empty" role="status">
      <div className="review-empty__icon" aria-hidden="true">
        {activeTab === "PENDING_REVIEW" ? "🎉" : "📋"}
      </div>
      <p className="review-empty__title">{msg.title}</p>
      <p className="review-empty__desc">{msg.desc}</p>
    </div>
  );
}

/**
 * ProductReviewList — renders product review rows with loading, empty, and data states.
 */
export default function ProductReviewList({
  products,
  loading,
  activeTab,
  onSelectProduct,
}) {
  if (loading) return <ReviewSkeleton />;

  if (!products || products.length === 0) {
    return <EmptyState activeTab={activeTab} />;
  }

  return (
    <div
      className="review-list"
      role="list"
      aria-label="Danh sách sản phẩm chờ duyệt"
    >
      <div className="review-list__header" aria-hidden="true">
        <span>Ảnh</span>
        <span>Tên sản phẩm</span>
        <span>Người bán</span>
        <span>Giá</span>
        <span>Trạng thái</span>
        <span>Ngày tạo</span>
        <span>Thao tác</span>
      </div>
      {products.map((product) => (
        <ProductReviewRow
          key={product.id}
          product={product}
          onClick={() => onSelectProduct(product)}
        />
      ))}
    </div>
  );
}
