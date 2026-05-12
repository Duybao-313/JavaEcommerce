import { parseApiResponse, request } from "./apiClient";
import { authFetch } from "./authService";

export async function getProducts() {
  const response = await request("/products");
  const payload = await parseApiResponse(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getProductDetail(productId) {
  const response = await request(`/products/${productId}`);
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getProductsBySeller(sellerId) {
  const response = await authFetch(`/products/seller/${sellerId}`);
  const payload = await parseApiResponse(response);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createProductWithImage(payload, imageFile) {
  const formData = new FormData();
  formData.append("name", payload?.name || "");
  formData.append("description", payload?.description || "");
  formData.append("price", String(payload?.price ?? ""));
  formData.append("stock", String(payload?.stock ?? ""));

  if (payload?.categoryId) {
    formData.append("categoryId", String(payload.categoryId));
  }
  if (payload?.categoryName) {
    formData.append("categoryName", payload.categoryName);
  }
  if (payload?.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }
  if (imageFile) {
    formData.append("image", imageFile);
  }
  if (payload?.salePrice) {
    formData.append("salePrice", String(payload.salePrice));
  }
  if (payload?.weight) {
    formData.append("weight", String(payload.weight));
  }
  if (payload?.sku) {
    formData.append("sku", payload.sku);
  }
  if (payload?.isFeatured != null) {
    formData.append("isFeatured", String(payload.isFeatured));
  }

  // Append variants as JSON string
  if (payload?.variants && payload.variants.length > 0) {
    formData.append("variants", JSON.stringify(payload.variants));
  }

  const response = await authFetch("/products", {
    method: "POST",
    body: formData,
  });
  const apiPayload = await parseApiResponse(response);
  return apiPayload?.data || null;
}

export async function updateSellerProduct(productId, payload) {
  const response = await authFetch(`/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const apiPayload = await parseApiResponse(response);
  return apiPayload?.data || null;
}

export async function deleteSellerProduct(productId) {
  const response = await authFetch(`/products/${productId}`, {
    method: "DELETE",
  });
  const apiPayload = await parseApiResponse(response);
  return apiPayload?.data || null;
}

export async function updateSellerProductImage(productId, imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await authFetch(`/products/${productId}/image`, {
    method: "PUT",
    body: formData,
  });
  const apiPayload = await parseApiResponse(response);
  return apiPayload?.data || null;
}
