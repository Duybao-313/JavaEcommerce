import React, { useEffect, useRef } from "react";
import "./ReviewChoiceModal.css";

export default function ReviewChoiceModal({ onReviewNow, onLater, onClose }) {
  const overlayRef = useRef(null);
  const reviewBtnRef = useRef(null);

  useEffect(() => {
    reviewBtnRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onLater();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onLater]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      onLater();
    }
  }

  return (
    <div
      className="rcm-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Bạn có muốn đánh giá sản phẩm?"
    >
      <div className="rcm-modal">
        <button
          className="rcm-close"
          onClick={onLater}
          aria-label="Đóng"
          type="button"
        >
          ✕
        </button>

        <div className="rcm-icon" aria-hidden="true">
          ⭐
        </div>

        <h2 className="rcm-title">Cảm ơn bạn đã xác nhận!</h2>
        <p className="rcm-desc">
          Đánh giá của bạn sẽ giúp người mua sau có thêm thông tin hữu ích. Bạn
          có thể đánh giá sau bất kỳ lúc nào trong chi tiết đơn hàng.
        </p>

        <div className="rcm-actions">
          <button
            ref={reviewBtnRef}
            type="button"
            className="rcm-btn rcm-btn-primary"
            onClick={onReviewNow}
          >
            ⭐ Đánh giá ngay
          </button>
          <button
            type="button"
            className="rcm-btn rcm-btn-secondary"
            onClick={onLater}
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
