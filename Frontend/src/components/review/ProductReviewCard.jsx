import React, { useState } from "react";
import ReviewUploadZone from "./ReviewUploadZone";
import "./ProductReviewCard.css";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function StarRating({ rating, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);

  return (
    <fieldset className="review-stars-fieldset">
      <legend className="review-stars-label">Đánh giá của bạn</legend>
      <div
        className="review-stars"
        role="radiogroup"
        aria-label="Chọn số sao đánh giá"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || rating);
          const starLabel =
            star === 1
              ? "Rất tệ"
              : star === 2
                ? "Tệ"
                : star === 3
                  ? "Bình thường"
                  : star === 4
                    ? "Tốt"
                    : "Rất tốt";

          return (
            <button
              key={star}
              type="button"
              className={`review-star-btn ${filled ? "review-star-filled" : "review-star-empty"}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              disabled={disabled}
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} sao: ${starLabel}`}
              title={starLabel}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="review-stars-caption">
          {rating === 5
            ? "Rất tốt"
            : rating === 4
              ? "Tốt"
              : rating === 3
                ? "Bình thường"
                : rating === 2
                  ? "Tệ"
                  : "Rất tệ"}
        </span>
      )}
    </fieldset>
  );
}

export default function ProductReviewCard({
  item,
  reviewData,
  onReviewChange,
  onSubmit,
  submitting,
  submitted,
}) {
  const {
    productId,
    variantId,
    productName,
    variantAttributes,
    productImageUrl,
    unitPrice,
    quantity,
  } = item;

  const rating = reviewData?.rating || 0;
  const comment = reviewData?.comment || "";
  const title = reviewData?.title || "";
  const files = reviewData?.files || [];

  function setRating(val) {
    onReviewChange(productId, variantId, { rating: val });
  }

  function setComment(e) {
    onReviewChange(productId, variantId, { comment: e.target.value });
  }

  function setTitle(e) {
    onReviewChange(productId, variantId, { title: e.target.value });
  }

  function setFiles(newFiles) {
    onReviewChange(productId, variantId, { files: newFiles });
  }

  const canSubmit = rating > 0 && title.trim().length > 0;

  if (submitted) {
    return (
      <div className="prc-card prc-card-submitted" role="status">
        <div className="prc-thumb-col">
          <div className="prc-thumb-placeholder">📦</div>
        </div>
        <div className="prc-info-col">
          <span className="prc-name">{productName}</span>
          {variantAttributes && (
            <span className="prc-variant">
              {formatVariant(variantAttributes)}
            </span>
          )}
          <span className="prc-submitted-badge">✅ Đã gửi đánh giá</span>
        </div>
      </div>
    );
  }

  return (
    <div className="prc-card">
      {/* Product info header */}
      <div className="prc-header">
        <div className="prc-thumb-col">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt={productName}
              className="prc-thumb"
              loading="lazy"
            />
          ) : (
            <div className="prc-thumb-placeholder">📦</div>
          )}
        </div>
        <div className="prc-info-col">
          <h3 className="prc-name">{productName}</h3>
          {variantAttributes && (
            <span className="prc-variant">
              {formatVariant(variantAttributes)}
            </span>
          )}
          {quantity && (
            <span className="prc-meta">
              Số lượng: {quantity}
              {unitPrice && ` — ${formatPrice(unitPrice)}/sp`}
            </span>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="prc-section">
        <StarRating
          rating={rating}
          onChange={setRating}
          disabled={submitting}
        />
      </div>

      {/* Title */}
      <div className="prc-section">
        <label
          htmlFor={`review-title-${productId}-${variantId || 0}`}
          className="prc-label"
        >
          Tiêu đề đánh giá <span className="prc-required">*</span>
        </label>
        <input
          id={`review-title-${productId}-${variantId || 0}`}
          type="text"
          className="prc-input"
          placeholder="Ví dụ: Áo đẹp, chất liệu tốt"
          value={title}
          onChange={setTitle}
          disabled={submitting}
          maxLength={255}
        />
      </div>

      {/* Comment */}
      <div className="prc-section">
        <label
          htmlFor={`review-comment-${productId}-${variantId || 0}`}
          className="prc-label"
        >
          Nhận xét chi tiết
        </label>
        <textarea
          id={`review-comment-${productId}-${variantId || 0}`}
          className="prc-textarea"
          placeholder="Chia sẻ thêm về chất lượng, kích cỡ, màu sắc, độ bền..."
          value={comment}
          onChange={setComment}
          disabled={submitting}
          rows={4}
          maxLength={2000}
        />
        <span className="prc-char-count">{comment.length}/2000</span>
      </div>

      {/* Upload */}
      <div className="prc-section">
        <ReviewUploadZone files={files} onFilesChange={setFiles} />
      </div>

      {/* Submit */}
      <div className="prc-actions">
        <button
          type="button"
          className="prc-submit-btn"
          disabled={!canSubmit || submitting}
          onClick={() => onSubmit(productId, variantId)}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}

function formatVariant(attrs) {
  try {
    const obj = typeof attrs === "string" ? JSON.parse(attrs) : attrs;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return String(attrs || "");
  }
}
