import React, { useState, useEffect, useRef } from "react";
import {
  formatPrice,
  formatDateTime,
  getReviewStatusInfo,
} from "../../../pages/admin/adminHelpers";
import { resolveImageUrl } from "../../../pages/admin/adminHelpers";

/**
 * ReasonModal — accessible modal for entering reject/request-changes reason.
 * Traps focus, requires min 10 characters, supports keyboard dismissal.
 */
function ReasonModal({
  title,
  actionLabel,
  confirmClass,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, textarea, input, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError("Vui lòng nhập ít nhất 10 ký tự.");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reason-modal-title"
      aria-describedby="reason-modal-desc"
    >
      <div
        className="modal-panel"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="reason-modal-title">{title}</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Đóng">
            <svg
              width="16"
              height="16"
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
        <div className="modal-body">
          <label htmlFor="reason-input">
            {actionLabel === "Từ chối"
              ? "Lý do từ chối"
              : "Nội dung yêu cầu chỉnh sửa"}
          </label>
          <textarea
            id="reason-input"
            ref={textareaRef}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder={
              actionLabel === "Từ chối"
                ? "VD: Thiếu ảnh mặt trước sản phẩm, vui lòng bổ sung..."
                : "VD: Vui lòng cập nhật mô tả chi tiết hơn và thêm ảnh thực tế..."
            }
            rows={4}
            aria-describedby="reason-modal-desc reason-error"
            aria-invalid={!!error}
          />
          {error && (
            <span id="reason-error" className="error-text" role="alert">
              {error}
            </span>
          )}
          <p id="reason-modal-desc" className="sr-only">
            Nhập lý do để thông báo cho người bán. Tối thiểu 10 ký tự.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            className={`btn-confirm ${confirmClass}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductReviewDrawer — slide-over panel showing product detail + admin actions.
 * Supports: Approve (instant), Reject (with reason modal), Request Changes (with reason modal).
 * Implements optimistic UI with rollback on API error.
 */
export default function ProductReviewDrawer({
  product,
  isOpen,
  onClose,
  onStatusUpdate,
}) {
  const [modalMode, setModalMode] = useState(null); // "REJECTED" | "PENDING_CHANGES" | null
  const [actionLoading, setActionLoading] = useState(false);
  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !modalMode) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, modalMode]);

  if (!isOpen || !product) return null;

  const statusInfo = getReviewStatusInfo(product.status);
  const sellerName =
    product.seller?.storeName || `Seller #${product.seller?.id || "?"}`;
  const thumbUrl = resolveImageUrl(product.imageUrl);
  const isPending =
    product.status === "PENDING_REVIEW" || product.status === "PENDING_CHANGES";

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await onStatusUpdate(product.id, { status: "ACTIVE" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await onStatusUpdate(product.id, { status: "REJECTED", reason });
      setModalMode(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (reason) => {
    setActionLoading(true);
    try {
      await onStatusUpdate(product.id, { status: "PENDING_CHANGES", reason });
      setModalMode(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Build audit timeline from available data
  const timelineItems = [];
  timelineItems.push({
    label: "Sản phẩm được tạo",
    date: product.createdAt,
    type: "created",
  });
  if (product.statusUpdatedAt && product.status !== "PENDING_REVIEW") {
    const updateLabel =
      product.status === "APPROVED" || product.status === "ACTIVE"
        ? "Admin đã duyệt"
        : product.status === "REJECTED"
          ? "Admin từ chối"
          : product.status === "PENDING_CHANGES"
            ? "Admin yêu cầu chỉnh sửa"
            : "Cập nhật trạng thái";
    timelineItems.push({
      label: updateLabel,
      date: product.statusUpdatedAt,
      type: "action",
    });
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="drawer-panel"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-desc"
      >
        {/* Header */}
        <div className="drawer-header">
          <h2 id="drawer-title">{product.name}</h2>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Đóng chi tiết"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body" id="drawer-desc">
          {/* Image gallery */}
          {thumbUrl && (
            <div className="drawer-section">
              <div className="drawer-section__title">Hình ảnh</div>
              <div className="drawer-images">
                <img src={thumbUrl} alt={`Ảnh ${product.name}`} />
                {product.gallery?.map((url, i) => (
                  <img
                    key={i}
                    src={resolveImageUrl(url)}
                    alt={`${product.name} ${i + 2}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="drawer-section">
              <div className="drawer-section__title">Mô tả</div>
              <p className="drawer-desc">{product.description}</p>
            </div>
          )}

          {/* Product meta */}
          <div className="drawer-section">
            <div className="drawer-section__title">Thông tin</div>
            <div className="drawer-meta">
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Giá gốc</span>
                <span className="drawer-meta__value">
                  {formatPrice(product.price)}
                </span>
              </div>
              {product.salePrice && (
                <div className="drawer-meta__item">
                  <span className="drawer-meta__label">Giá khuyến mãi</span>
                  <span className="drawer-meta__value">
                    {formatPrice(product.salePrice)}
                  </span>
                </div>
              )}
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Tồn kho</span>
                <span className="drawer-meta__value">{product.stock ?? 0}</span>
              </div>
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">SKU</span>
                <span className="drawer-meta__value">{product.sku || "—"}</span>
              </div>
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Danh mục</span>
                <span className="drawer-meta__value">
                  {product.category?.name || "—"}
                </span>
              </div>
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Người bán</span>
                <span className="drawer-meta__value">{sellerName}</span>
              </div>
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Trạng thái</span>
                <span className={`review-row__badge ${statusInfo.cls}`}>
                  <span aria-hidden="true">{statusInfo.icon}</span>
                  {statusInfo.label}
                </span>
              </div>
              <div className="drawer-meta__item">
                <span className="drawer-meta__label">Lượt xem</span>
                <span className="drawer-meta__value">
                  {product.viewCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section__title">
                Biến thể ({product.variants.length})
              </div>
              <div className="drawer-variants">
                {product.variants.map((v, i) => {
                  const attrText = v.attributes
                    ? Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(", ")
                    : "";
                  return (
                    <div key={v.id || i} className="drawer-variant-chip">
                      {attrText || `#${i + 1}`} — {formatPrice(v.price)} / SL:{" "}
                      {v.stock}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin note (if rejected or changes requested) */}
          {product.adminNote && (
            <div className="drawer-section">
              <div className="drawer-section__title">Ghi chú của Admin</div>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "oklch(0.97 0.01 25)",
                  borderRadius: "0.625rem",
                  border: "1px solid oklch(0.88 0.04 25)",
                  fontSize: "0.8125rem",
                  color: "oklch(0.25 0.005 90)",
                  lineHeight: 1.55,
                }}
              >
                {product.adminNote}
              </div>
            </div>
          )}

          {/* Audit timeline */}
          <div className="drawer-section">
            <div className="drawer-section__title">Lịch sử</div>
            <div className="drawer-timeline">
              {timelineItems.map((item, i) => (
                <div
                  key={i}
                  className={`drawer-timeline__item ${
                    item.type === "action"
                      ? "drawer-timeline__item--action"
                      : ""
                  }`}
                >
                  <div className="drawer-timeline__dot" />
                  <div className="drawer-timeline__label">{item.label}</div>
                  <div className="drawer-timeline__date">
                    {formatDateTime(item.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {isPending && (
          <div className="drawer-footer">
            <button
              className="btn-action btn-action--approve"
              onClick={handleApprove}
              disabled={actionLoading}
              aria-label="Duyệt sản phẩm"
            >
              {actionLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Đang duyệt...
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Duyệt
                </>
              )}
            </button>
            <button
              className="btn-action btn-action--reject"
              onClick={() => setModalMode("REJECTED")}
              disabled={actionLoading}
              aria-label="Từ chối sản phẩm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Từ chối
            </button>
            <button
              className="btn-action btn-action--changes"
              onClick={() => setModalMode("PENDING_CHANGES")}
              disabled={actionLoading}
              aria-label="Yêu cầu chỉnh sửa"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Yêu cầu sửa
            </button>
          </div>
        )}

        {!isPending && (
          <div className="drawer-footer">
            <span
              style={{ fontSize: "0.8125rem", color: "oklch(0.5 0.01 90)" }}
            >
              Sản phẩm đã được xử lý — trạng thái hiện tại:{" "}
              <strong>{statusInfo.label}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Reason Modal */}
      <ReasonModal
        title={
          modalMode === "REJECTED" ? "Từ chối sản phẩm" : "Yêu cầu chỉnh sửa"
        }
        actionLabel={modalMode === "REJECTED" ? "Từ chối" : "Gửi yêu cầu"}
        confirmClass={
          modalMode === "REJECTED"
            ? "btn-confirm--reject"
            : "btn-confirm--changes"
        }
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        onConfirm={
          modalMode === "REJECTED" ? handleReject : handleRequestChanges
        }
        loading={actionLoading}
      />
    </>
  );
}
