import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

export async function checkout(checkoutRequest) {
  const response = await authFetch("/orders/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutRequest),
  });

  const payload = await parseApiResponse(response);
  return payload?.data || null;
}

export async function getMyOrders() {
  const response = await authFetch("/orders/my");
  const payload = await parseApiResponse(response);
  return payload?.data || null;
}
