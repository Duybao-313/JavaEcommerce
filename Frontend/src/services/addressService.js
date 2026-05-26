import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

const BASE = "/addresses";

export async function getAddresses() {
  const res = await authFetch(BASE);
  const payload = await parseApiResponse(res);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getDefaultAddress() {
  try {
    const res = await authFetch(`${BASE}/default`);
    const payload = await parseApiResponse(res);
    return payload?.data || null;
  } catch {
    return null;
  }
}

export async function createAddress(data) {
  const res = await authFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function updateAddress(id, data) {
  const res = await authFetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

export async function deleteAddress(id) {
  const res = await authFetch(`${BASE}/${id}`, { method: "DELETE" });
  await parseApiResponse(res);
  return true;
}

export async function setDefaultAddress(id) {
  const res = await authFetch(`${BASE}/${id}/default`, { method: "PUT" });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}

// Google Maps proxy (qua backend)
export async function autocompleteAddress(query) {
  if (!query || query.length < 3) return [];
  const res = await authFetch(
    `/maps/autocomplete?input=${encodeURIComponent(query)}`,
  );
  const payload = await parseApiResponse(res);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getPlaceDetails(placeId) {
  const res = await authFetch(
    `/maps/place-details?placeId=${encodeURIComponent(placeId)}`,
  );
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}
