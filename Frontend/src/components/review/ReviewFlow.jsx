import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReviewChoiceModal from "./ReviewChoiceModal";
import ProductReviewCard from "./ProductReviewCard";
import { createReview } from "../../services/reviewService";
import { authFetch } from "../../services/authService";
import "./ReviewFlow.css";

/**
 * ReviewFlow — full review lifecycle component.
 *
 * Props:
 *   order            — order object with items, orderId, status
 *   onReviewComplete — callback after all reviews submitted (optional)
 *   embedded         — if true, renders inline; if false, renders modal trigger
 */
export default function ReviewFlow({
  order,
  onReviewComplete,
  embedded = false,
}) {
  const [showChoice, setShowChoice] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Map: "productId-variantId" -> { rating, comment, title, files }
  const [reviewsData, setReviewsData] = useState({});
  // Map: "productId-variantId" -> true (submitted)
  const [submittedItems, setSubmittedItems] = useState({});
  // Map: "productId-variantId" -> true (submitting)
  const [submittingItems, setSubmittingItems] = useState({});

  const isDelivered = String(order?.status || "").toUpperCase() === "DELIVERED";

  // Build review key
  const itemKey = useCallback(
    (item) => `${item.productId}-${item.variantId || 0}`,
    [],
  );

  // Check if all items are reviewed
  const allReviewed =
    order?.items?.length > 0 && order.items.every((item) => item.reviewed);

  const allSubmitted =
    order?.items?.length > 0 &&
    order.items.every((item) => {
      const key = itemKey(item);
      return item.reviewed || submittedItems[key];
    });

  // Reset state when order changes
  useEffect(() => {
    setReviewsData({});
    setSubmittedItems({});
    setSubmittingItems({});
    setShowChoice(false);
    setShowForm(false);
  }, [order?.orderId]);

  function handleConfirmReceived() {
    setShowChoice(true);
  }

  function handleReviewNow() {
    setShowChoice(false);
    setShowForm(true);
  }

  function handleLater() {
    setShowChoice(false);
  }

  function handleReviewChange(productId, variantId, changes) {
    const key = `${productId}-${variantId || 0}`;
    setReviewsData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...changes },
    }));
  }

  async function handleSubmitItem(productId, variantId) {
    const key = `${productId}-${variantId || 0}`;
    const data = reviewsData[key];
    if (!data || !data.rating || !data.title?.trim()) return;

    setSubmittingItems((prev) => ({ ...prev, [key]: true }));

    try {
      // Upload images first if any — for now use placeholder URLs
      // In production, upload to server and get URLs back
      const imageUrls = await uploadImages(data.files || []);

      await createReview({
        productId,
        variantId: variantId || null,
        orderId: order.orderId,
        rating: data.rating,
        title: data.title.trim(),
        comment: data.comment?.trim() || "",
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      });

      setSubmittedItems((prev) => ({ ...prev, [key]: true }));
      toast.success("Gửi đánh giá thành công!");
    } catch (err) {
      toast.error(err.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmittingItems((prev) => ({ ...prev, [key]: false }));
    }
  }

  // If all items submitted, notify parent
  useEffect(() => {
    if (allSubmitted && order?.items?.length > 0) {
      onReviewComplete?.();
    }
  }, [allSubmitted, order?.items?.length, onReviewComplete]);

  // ---- Render: Embedded mode (used in OrderDetailPage) ----
  if (embedded) {
    return (
      <>
        {/* Confirm received banner */}
        {isDelivered && !allReviewed && !showForm && (
          <div className="rf-banner">
            <div className="rf-banner-content">
              <span className="rf-banner-icon" aria-hidden="true">
                ⭐
              </span>
              <div className="rf-banner-text">
                <strong>Bạn có muốn đánh giá sản phẩm?</strong>
                <span className="rf-banner-sub">
                  Đánh giá của bạn giúp ích cho cộng đồng mua sắm
                </span>
              </div>
            </div>
            <button
              type="button"
              className="rf-banner-btn"
              onClick={handleConfirmReceived}
            >
              Đánh giá ngay
            </button>
          </div>
        )}

        {/* Review form */}
        {showForm && (
          <section className="rf-section" aria-label="Đánh giá sản phẩm">
            <div className="rf-header">
              <h2 className="rf-heading">Đánh giá sản phẩm</h2>
              <p className="rf-subheading">
                Đánh giá của bạn sẽ hiển thị công khai sau khi được duyệt
              </p>
            </div>

            <div className="rf-cards">
              {(order.items || []).map((item) => {
                const key = itemKey(item);
                if (item.reviewed) {
                  return <ProductReviewCard key={key} item={item} submitted />;
                }
                return (
                  <ProductReviewCard
                    key={key}
                    item={item}
                    reviewData={reviewsData[key] || {}}
                    onReviewChange={handleReviewChange}
                    onSubmit={handleSubmitItem}
                    submitting={submittingItems[key]}
                    submitted={submittedItems[key]}
                  />
                );
              })}
            </div>

            {/* Summary after all submitted */}
            {allSubmitted && (
              <div className="rf-success" role="status">
                <span className="rf-success-icon">🎉</span>
                <h3 className="rf-success-title">
                  Cảm ơn bạn đã gửi đánh giá!
                </h3>
                <p className="rf-success-desc">
                  Đánh giá của bạn đã được ghi nhận và sẽ hiển thị sau khi được
                  duyệt.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Choice modal */}
        {showChoice && (
          <ReviewChoiceModal
            onReviewNow={handleReviewNow}
            onLater={handleLater}
            onClose={handleLater}
          />
        )}
      </>
    );
  }

  // ---- Render: Non-embedded mode (review per item button) ----
  return null;
}

/**
 * Placeholder upload function — replace with real Cloudinary/upload service.
 */
async function uploadImages(files) {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  try {
    const response = await authFetch("/upload/multiple", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json().catch(() => null);
    if (payload?.data?.urls) return payload.data.urls;
    if (payload?.data)
      return Array.isArray(payload.data) ? payload.data : [payload.data];
    return [];
  } catch {
    // If upload fails, return empty — review can still be submitted without images
    return [];
  }
}
