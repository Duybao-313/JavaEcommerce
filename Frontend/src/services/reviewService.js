import { parseApiResponse, request } from "./apiClient";
import { authFetch } from "./authService";

/**
 * Create a review for a product in an order.
 * @param {{ productId, variantId, orderId, rating, title, comment, images }} data
 * @returns {Promise<object>} Created review
 */
export async function createReview(data) {
  const response = await authFetch("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

/**
 * Get reviewable items for an order.
 * @param {number|string} orderId
 * @returns {Promise<Array>} List of reviewable items
 */
export async function getReviewableItems(orderId) {
  const response = await authFetch(`/orders/${orderId}/reviewable-items`);
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

/**
 * Get all approved reviews for a product (public).
 * @param {number|string} productId
 * @returns {Promise<Array>} List of reviews
 */
export async function getProductReviews(productId) {
  const response = await request(`/reviews/product/${productId}/approved`);
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}

/**
 * Get review summary for a product (avg rating, count, recent reviews) - public.
 * @param {number|string} productId
 * @returns {Promise<{ productId, avgRating, reviewCount, recentReviews }>}
 */
export async function getProductReviewSummary(productId) {
  const response = await request(`/reviews/product/${productId}/summary`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

/**
 * Get reviews by the current user.
 * @param {number|string} userId
 * @returns {Promise<Array>} List of reviews
 */
export async function getUserReviews(userId) {
  const response = await authFetch(`/reviews/user/${userId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || [];
}
