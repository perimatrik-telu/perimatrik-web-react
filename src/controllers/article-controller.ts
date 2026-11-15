import {
  ARTICLE_DATA_URL,
  DETAIL_ARTICLE_DATA_URL,
  ARTICLE_BY_ID_DATA_URL,
} from "../constants/constant";
import { fetchApi } from "../utils/api"; // Updated import path
import type { ArticleModel, ArticleDetailModel } from "../types/models"; // Import models

interface MutationResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface GetAllArticlesOptions {
  page?: number;
  limit?: number;
  userId?: string;
}

export async function getAllArticles(
  options: GetAllArticlesOptions = {},
): Promise<ArticleModel | null> {
  const { page = 1, limit = 12, userId } = options;
  try {
    let url = `${ARTICLE_DATA_URL}?page=${page}&limit=${limit}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    const data: ArticleModel = await fetchApi(url);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function getArticleBySlug(
  slug: string | undefined,
): Promise<ArticleDetailModel | null> {
  if (!slug) {
    console.error("getArticleBySlug: Slug is undefined.");
    return null;
  }
  try {
    const data: ArticleDetailModel = await fetchApi(
      `${DETAIL_ARTICLE_DATA_URL}/${slug}`,
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function createArticle(formData: FormData): Promise<MutationResponse> {
  try {
    const data = await fetchApi<MutationResponse>(ARTICLE_DATA_URL, {
      method: "POST",
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false, message: "Failed to create article." };
  }
}

export async function deleteArticle(id: string): Promise<MutationResponse | null> {
  try {
    const data = await fetchApi<MutationResponse>(`${ARTICLE_DATA_URL}/${id}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting article:", error);
    return null; // Return null on error
  }
}

export async function getRelatedArticles(
  slug: string,
): Promise<ArticleModel | null> {
  try {
    const data: ArticleModel = await fetchApi(
      `${ARTICLE_DATA_URL}/${slug}/related`,
    );
    return data;
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return null;
  }
}

export async function updateArticle(
  id: string,
  formData: FormData,
): Promise<MutationResponse> {
  try {
    const data = await fetchApi<MutationResponse>(`${ARTICLE_DATA_URL}/${id}`, {
      method: "POST",
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error updating article:", error);
    return { success: false, message: "Failed to update article." };
  }
}

export async function getArticleById(
  id: string,
): Promise<ArticleDetailModel | null> {
  try {
    const data: ArticleDetailModel = await fetchApi(
      `${ARTICLE_BY_ID_DATA_URL}/${id}`,
    );
    return data;
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }
}
