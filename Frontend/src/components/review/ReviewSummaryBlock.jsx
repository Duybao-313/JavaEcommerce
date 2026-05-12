import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductReviewSummary } from "../../services/reviewService";
import "./ReviewSummaryBlock.css";

function StarRating({ rating, size = 16 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill =
      rating >= i
        ? "currentColor"
        : rating >= i - 0.5
          ? "url(#halfGrad)"
          : "none";
    stars.push(
      <svg
        key={i}
        className="rsb-star"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill={fill}
        stroke="currentColor"
        strokeWidth="1"
      >
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
    );
  }
  return <span className="rsb-stars">{stars}</span>;
}

function ReviewCard({ review }) {
  const images = (() => {
    if (!review.images) return [];
    try {
      const parsed =
        typeof review.images === "string"
          ? JSON.parse(review.images)
          : review.images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return (
    <article className="rsb-review-card">
      <div className="rsb-review-header">
        <div className="rsb-reviewer-avatar">
          {review.reviewerName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="rsb-reviewer-info">
          <p className="rsb-reviewer-name">
            {review.reviewerName || "Người dùng"}
          </p>
          <div className="rsb-review-rating-row">
            <StarRating rating={review.rating} size={12} />
            <span className="rsb-review-date">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                : ""}
            </span>
          </div>
        </div>
      </div>
      {review.title && <p className="rsb-review-title">{review.title}</p>}
      {review.comment && <p className="rsb-review-comment">{review.comment}</p>}
      {images.length > 0 && (
        <div className="rsb-review-images">
          {images.slice(0, 4).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Review ${idx + 1}`}
              className="rsb-review-image"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function ReviewSummaryBlock() {
  const { productId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await getProductReviewSummary(productId);
      setSummary(data);
    } catch {
      // Silently fail - review block is optional
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <section className="rsb-container">
        <div className="rsb-skeleton">
          <div className="rsb-skel-avg" />
          <div className="rsb-skel-cards">
            {[1, 2].map((i) => (
              <div key={i} className="rsb-skel-card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!summary || summary.reviewCount === 0) {
    return (
      <section className="rsb-container">
        <div className="rsb-empty">
          <h2 className="rsb-heading">Đánh giá sản phẩm</h2>
          <p className="rsb-empty-text">
            Sản phẩm này chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </p>
        </div>
      </section>
    );
  }

  const { avgRating, reviewCount, recentReviews } = summary;

  return (
    <section className="rsb-container">
      <div className="rsb-header">
        <h2 className="rsb-heading">Đánh giá sản phẩm</h2>
      </div>

      {/* Rating Summary Bar */}
      <div className="rsb-summary-bar">
        <div className="rsb-avg-section">
          <p className="rsb-avg-number">
            {avgRating != null ? Number(avgRating).toFixed(1) : "0.0"}
          </p>
          <StarRating rating={avgRating || 0} size={20} />
          <p className="rsb-total-reviews">({reviewCount} đánh giá)</p>
        </div>
      </div>

      {/* Recent Reviews */}
      {recentReviews && recentReviews.length > 0 && (
        <div className="rsb-reviews-list">
          {recentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* See More Button */}
      {reviewCount > (recentReviews?.length || 0) && (
        <div className="rsb-see-more">
          <Link
            to={`/products/${productId}/reviews`}
            className="rsb-see-more-btn"
          >
            Xem tất cả {reviewCount} đánh giá →
          </Link>
        </div>
      )}
    </section>
  );
}
