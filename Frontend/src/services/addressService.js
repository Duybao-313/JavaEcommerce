import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

const BASE = "/addresses";

export async function getMyAddresses() {
  const res = await authFetch(BASE);
  const payload = await parseApiResponse(res);
  return Array.isArray(payload?.data) ? payload.data : [];
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
  const res = await authFetch(`${BASE}/${id}`, {
    method: "DELETE",
  });
  await parseApiResponse(res);
  return true;
}

export async function setDefaultAddress(id) {
  const res = await authFetch(`${BASE}/${id}/default`, {
    method: "PATCH",
  });
  const payload = await parseApiResponse(res);
  return payload?.data || null;
}
