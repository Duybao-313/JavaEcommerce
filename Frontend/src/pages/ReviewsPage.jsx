import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProductReviews,
  getProductReviewSummary,
} from "../services/reviewService";
import { getProductDetail } from "../services/productService";

function StarRating({ rating, size = 16 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill =
      rating >= i
        ? "currentColor"
        : rating >= i - 0.5
          ? "url(#halfGrad2)"
          : "none";
    stars.push(
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill={fill}
        stroke="currentColor"
        strokeWidth="1"
      >
        <defs>
          <linearGradient id="halfGrad2">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
    );
  }
  return <span className="rp-stars">{stars}</span>;
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="rp-rating-bar-row">
      <span className="rp-rating-bar-label">{stars} ★</span>
      <div className="rp-rating-bar-track">
        <div className="rp-rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rp-rating-bar-count">{count}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [productData, reviewsData, summaryData] = await Promise.all([
        getProductDetail(productId).catch(() => null),
        getProductReviews(productId),
        getProductReviewSummary(productId),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Rating distribution
  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDist[r.rating]++;
    }
  });

  if (loading) {
    return (
      <div className="rp-page">
        <div className="rp-container">
          <p className="rp-loading">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      <div className="rp-container">
        {/* Breadcrumb */}
        <div className="rp-breadcrumb">
          <Link to="/products" className="rp-bread-link">
            Sản phẩm
          </Link>
          <span className="rp-bread-sep">/</span>
          {product && (
            <>
              <Link to={`/products/${productId}`} className="rp-bread-link">
                {product.name}
              </Link>
              <span className="rp-bread-sep">/</span>
            </>
          )}
          <span className="rp-bread-current">Đánh giá</span>
        </div>

        {/* Product Info */}
        {product && (
          <div className="rp-product-info">
            <Link to={`/products/${productId}`} className="rp-product-link">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="rp-product-img"
              />
              <div>
                <h1 className="rp-product-name">{product.name}</h1>
                <p className="rp-product-back">← Quay lại sản phẩm</p>
              </div>
            </Link>
          </div>
        )}

        {/* Rating Summary */}
        {summary && summary.reviewCount > 0 && (
          <div className="rp-summary">
            <div className="rp-avg-block">
              <p className="rp-avg-big">
                {summary.avgRating != null
                  ? Number(summary.avgRating).toFixed(1)
                  : "0.0"}
              </p>
              <StarRating rating={summary.avgRating || 0} size={20} />
              <p className="rp-total">{summary.reviewCount} đánh giá</p>
            </div>
            <div className="rp-distribution">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  stars={star}
                  count={ratingDist[star]}
                  total={reviews.length}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Reviews */}
        {reviews.length === 0 ? (
          <div className="rp-empty">
            <p>Sản phẩm này chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="rp-reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .rp-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f7f7f4 0%, #f4f4ef 45%, #ffffff 100%);
          padding: 2.5rem 1.5rem;
        }
        .rp-container {
          max-width: 48rem;
          margin: 0 auto;
        }
        .rp-loading {
          text-align: center;
          font-size: 0.875rem;
          color: #71717a;
        }
        .rp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 1.5rem;
        }
        .rp-bread-link {
          color: #71717a;
          text-decoration: none;
        }
        .rp-bread-link:hover {
          color: #18181b;
        }
        .rp-bread-sep {
          color: #d4d4d8;
        }
        .rp-bread-current {
          color: #18181b;
        }
        .rp-product-info {
          margin-bottom: 1.5rem;
        }
        .rp-product-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #e4e4e7;
          background: #fff;
          transition: box-shadow 0.15s;
        }
        .rp-product-link:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .rp-product-img {
          width: 4rem;
          height: 4rem;
          border-radius: 0.75rem;
          object-fit: cover;
          border: 1px solid #e4e4e7;
        }
        .rp-product-name {
          font-size: 1rem;
          font-weight: 600;
          color: #18181b;
        }
        .rp-product-back {
          font-size: 0.75rem;
          color: #71717a;
          margin-top: 0.25rem;
        }
        .rp-summary {
          display: flex;
          gap: 2rem;
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e4e4e7;
          background: #fff;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .rp-avg-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 6rem;
        }
        .rp-avg-big {
          font-size: 2.5rem;
          font-weight: 700;
          color: #18181b;
          line-height: 1;
        }
        .rp-stars {
          display: inline-flex;
          gap: 2px;
          color: #facc15;
          margin-top: 0.25rem;
        }
        .rp-total {
          font-size: 0.8125rem;
          color: #71717a;
          margin-top: 0.25rem;
        }
        .rp-distribution {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          min-width: 12rem;
        }
        .rp-rating-bar-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .rp-rating-bar-label {
          font-size: 0.75rem;
          color: #71717a;
          width: 2rem;
          text-align: right;
        }
        .rp-rating-bar-track {
          flex: 1;
          height: 0.5rem;
          border-radius: 9999px;
          background: #e4e4e7;
          overflow: hidden;
        }
        .rp-rating-bar-fill {
          height: 100%;
          border-radius: 9999px;
          background: #facc15;
          transition: width 0.3s;
        }
        .rp-rating-bar-count {
          font-size: 0.75rem;
          color: #a1a1aa;
          width: 2rem;
          text-align: left;
        }
        .rp-reviews-list {
          display: flex;
          flex-direction: column;
        }
        .rp-empty {
          text-align: center;
          padding: 2.5rem;
          border-radius: 1rem;
          border: 1px solid #e4e4e7;
          background: #fff;
          color: #71717a;
          font-size: 0.875rem;
        }
        /* Review Card */
        .rp-review-card {
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e4e4e7;
          background: #fff;
          margin-bottom: 0.75rem;
        }
        .rp-review-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .rp-reviewer-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: #e4e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #52525b;
          flex-shrink: 0;
        }
        .rp-reviewer-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #18181b;
        }
        .rp-review-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2px;
        }
        .rp-review-date {
          font-size: 0.75rem;
          color: #a1a1aa;
        }
        .rp-review-title {
          margin-top: 0.625rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #27272a;
        }
        .rp-review-comment {
          margin-top: 0.375rem;
          font-size: 0.875rem;
          color: #52525b;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .rp-review-images {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .rp-review-image {
          width: 5rem;
          height: 5rem;
          border-radius: 0.625rem;
          object-fit: cover;
          border: 1px solid #e4e4e7;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .rp-review-image:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
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
    <article className="rp-review-card">
      <div className="rp-review-header">
        <div className="rp-reviewer-avatar">
          {review.reviewerName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="rp-reviewer-name">
            {review.reviewerName || "Người dùng"}
          </p>
          <div className="rp-review-meta">
            <StarRating rating={review.rating} size={14} />
            <span className="rp-review-date">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                : ""}
            </span>
          </div>
        </div>
      </div>
      {review.title && <p className="rp-review-title">{review.title}</p>}
      {review.comment && <p className="rp-review-comment">{review.comment}</p>}
      {images.length > 0 && (
        <div className="rp-review-images">
          {images.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Review ${idx + 1}`}
              className="rp-review-image"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </article>
  );
}
