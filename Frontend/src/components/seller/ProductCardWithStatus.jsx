import React from "react";
import { Link } from "react-router-dom";
import {
  formatPrice,
  formatDateTime,
  getReviewStatusInfo,
} from "../../pages/admin/adminHelpers";
import { resolveImageUrl } from "../../pages/admin/adminHelpers";

/**
 * ProductCardWithStatus — a product card for the seller dashboard that shows
 * product status (Draft, Pending, Approved, Rejected) with admin reason if rejected.
 * Includes CTA links for edit/preview.
 */
export default function ProductCardWithStatus({ product }) {
  const statusInfo = getReviewStatusInfo(product.status);
  const thumbUrl = resolveImageUrl(product.imageUrl);
  const hasReason =
    product.adminNote &&
    (product.status === "REJECTED" || product.status === "PENDING_CHANGES");

  return (
    <div
      className="product-card-status"
      role="article"
      aria-label={`${product.name}, trạng thái ${statusInfo.label}`}
    >
      <img
        className="product-card-status__thumb"
        src={
          thumbUrl ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e5e0' width='80' height='80'/%3E%3C/svg%3E"
        }
        alt={`Ảnh ${product.name}`}
        loading="lazy"
      />

      <div className="product-card-status__body">
        <div className="product-card-status__name">{product.name}</div>

        <div className="product-card-status__meta">
          <span className="product-card-status__price">
            {formatPrice(product.salePrice || product.price)}
          </span>
          <span className="product-card-status__stock">
            Tồn: {product.stock ?? 0} | Đã bán: {product.soldCount ?? 0}
          </span>
        </div>

        <span
          className={`product-card-status__badge ${statusInfo.cls}`}
          aria-label={`Trạng thái: ${statusInfo.label}`}
        >
          <span aria-hidden="true">{statusInfo.icon}</span>
          {statusInfo.label}
        </span>

        {/* Admin reason (rejected / changes requested) */}
        {hasReason && (
          <div className="product-card-status__reason">
            <div className="product-card-status__reason-label">
              {product.status === "REJECTED"
                ? "Lý do từ chối:"
                : "Yêu cầu từ Admin:"}
            </div>
            {product.adminNote}
          </div>
        )}

        {/* Action links */}
        <div className="product-card-status__actions">
          <Link
            to={`/products/${product.id}`}
            className="product-card-status__action-link"
            aria-label={`Xem chi tiết ${product.name}`}
          >
            Xem
          </Link>
          {(product.status === "REJECTED" ||
            product.status === "PENDING_CHANGES" ||
            product.status === "PENDING_REVIEW" ||
            product.status === "ACTIVE" ||
            product.status === "APPROVED") && (
            <Link
              to={`/seller/products/create`}
              state={{ editProductId: product.id }}
              className="product-card-status__action-link"
              aria-label={`Chỉnh sửa ${product.name}`}
            >
              Chỉnh sửa
            </Link>
          )}
          <span
            style={{
              fontSize: "0.6875rem",
              color: "oklch(0.5 0.01 90)",
              marginLeft: "auto",
            }}
          >
            {formatDateTime(product.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
