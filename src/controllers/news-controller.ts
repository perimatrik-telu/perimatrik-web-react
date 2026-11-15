import {
  NEWS_DATA_URL,
  DETAIL_NEWS_DATA_URL,
  NEWS_BY_ID_DATA_URL,
} from "../constants/constant";
import { fetchApi } from "../utils/api";
import type { ArticleModel, ArticleDetailModel } from "../types/models";

interface MutationResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

// We can reuse ArticleModel and ArticleDetailModel for News as they have the same structure
export async function getAllNews(
  page: number = 1,
  limit: number = 12,
  userId?: string
): Promise<ArticleModel | null> {
  try {
    let url = `${NEWS_DATA_URL}?page=${page}&limit=${limit}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    const data: ArticleModel = await fetchApi(url);
    return data;
  } catch (error) {
    console.error("Error fetching news data:", error);
    return null;
  }
}

export async function getNewsBySlug(
  slug: string | undefined
): Promise<ArticleDetailModel | null> {
  if (!slug) {
    console.error("getNewsBySlug: Slug is undefined.");
    return null;
  }
  try {
    const data: ArticleDetailModel = await fetchApi(
      `${DETAIL_NEWS_DATA_URL}/${slug}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching news data:", error);
    return null;
  }
}

export async function createNews(formData: FormData): Promise<MutationResponse> {
  try {
    const data = await fetchApi<MutationResponse>(NEWS_DATA_URL, {
      method: "POST",
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error creating news:", error);
    return { success: false, message: "Failed to create news." };
  }
}

export async function deleteNews(id: string): Promise<MutationResponse | null> {
  try {
    const data = await fetchApi<MutationResponse>(`${NEWS_DATA_URL}/${id}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting news:", error);
    return null;
  }
}

export async function getRelatedNews(
  slug: string
): Promise<ArticleModel | null> {
  try {
    const data: ArticleModel = await fetchApi(
      `${NEWS_DATA_URL}/${slug}/related`
    );
    return data;
  } catch (error) {
    console.error("Error fetching related news:", error);
    return null;
  }
}

export async function updateNews(
  id: string,
  formData: FormData
): Promise<MutationResponse> {
  try {
    const data = await fetchApi<MutationResponse>(`${NEWS_DATA_URL}/${id}`, {
      method: "POST",
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error updating news:", error);
    return { success: false, message: "Failed to update news." };
  }
}

export async function getNewsById(
  id: string
): Promise<ArticleDetailModel | null> {
  try {
    const data: ArticleDetailModel = await fetchApi(
      `${NEWS_BY_ID_DATA_URL}/${id}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching news with ID ${id}:`, error);
    return null;
  }
}
