import { GALLERY_DATA_URL } from "../constants/constant";
import { fetchApi } from "../utils/api"; // Updated import path
import type { GalleryModel, GalleryDetailModel } from "@/types/models"; // Import GalleryModel and GalleryDetailModel

interface MutationResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export async function createGallery(formData: FormData): Promise<MutationResponse> {
  return fetchApi<MutationResponse>(GALLERY_DATA_URL, {
    method: "POST",
    body: formData,
  });
}

export async function getAllGalleries(
  page: number = 1,
  limit: number = 10,
  userId?: string
): Promise<GalleryModel | null> {
  try {
    let url = `${GALLERY_DATA_URL}?page=${page}&limit=${limit}`; // Use the passed limit
    if (userId) {
      url += `&user_id=${userId}`; // Use & instead of ?
    }
    const data: GalleryModel = await fetchApi(url);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function deleteGallery(id: string): Promise<boolean> {
  try {
    await fetchApi(`${GALLERY_DATA_URL}/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error(`Error deleting gallery with id ${id}:`, error);
    return false;
  }
}

export async function updateGallery(
  id: string,
  formData: FormData
): Promise<MutationResponse> {
  try {
    formData.append("_method", "PUT"); // Add _method field for Laravel
    const data = await fetchApi<MutationResponse>(`${GALLERY_DATA_URL}/${id}`, {
      method: "POST", // Change method to POST
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error updating gallery:", error);
    return { success: false, message: "Failed to update gallery." };
  }
}

export async function getGalleryById(id: string): Promise<GalleryDetailModel | null> {
  try {
    const data: GalleryDetailModel = await fetchApi(`${GALLERY_DATA_URL}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching gallery with id ${id}:`, error);
    return null;
  }
}
