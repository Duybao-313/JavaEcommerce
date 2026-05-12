import { parseApiResponse } from "./apiClient";
import { authFetch } from "./authService";

export async function uploadImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await authFetch("/upload/image", {
    method: "POST",
    body: formData,
  });
  const payload = await parseApiResponse(response);
  return payload?.data?.imageUrl || null;
}
