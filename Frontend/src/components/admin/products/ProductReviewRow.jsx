import React from "react";
import {
  formatPrice,
  formatDateTime,
  getReviewStatusInfo,
} from "../../../pages/admin/adminHelpers";
import { resolveImageUrl } from "../../../pages/admin/adminHelpers";

/**
 * ProductReviewRow — a single product row in the admin review list.
 * Keyboard accessible, shows thumbnail, name, seller, price, status badge, date.
 */
export default function ProductReviewRow({ product, onClick }) {
  const statusInfo = getReviewStatusInfo(product.status);
  const thumbUrl = resolveImageUrl(product.imageUrl);
  const sellerName =
    product.seller?.storeName || `Seller #${product.seller?.id || "?"}`;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="review-row"
      role="listitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${product.name}, trạng thái ${statusInfo.label}`}
    >
      <img
        className="review-row__thumb"
        src={
          thumbUrl ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23e5e5e0' width='40' height='40'/%3E%3C/svg%3E"
        }
        alt={`Ảnh ${product.name}`}
        loading="lazy"
      />
      <span className="review-row__name">{product.name}</span>
      <span className="review-row__seller">{sellerName}</span>
      <span className="review-row__price">
        {formatPrice(product.salePrice || product.price)}
      </span>
      <span
        className={`review-row__badge ${statusInfo.cls}`}
        aria-label={`Trạng thái: ${statusInfo.label}`}
      >
        <span aria-hidden="true">{statusInfo.icon}</span>
        {statusInfo.label}
      </span>
      <span className="review-row__date">
        {formatDateTime(product.createdAt)}
      </span>
      <span className="review-row__actions">
        <span className="btn-action btn-action--approve" aria-hidden="true">
          Xem
        </span>
      </span>
    </div>
  );
}
