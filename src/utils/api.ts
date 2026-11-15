import { MAIN_URL } from "../constants/constant";
import Cookies from "js-cookie";

interface RequestOptions extends Omit<RequestInit, "body"> {
  headers?: Record<string, string>;
  body?: BodyInit | object;
}

/** Error thrown for non-2xx responses; network failures/aborts stay plain TypeErrors. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = Cookies.get("auth_token") || null;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  // Only set Content-Type to application/json if the body is not FormData
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const { body, ...requestOptions } = options ?? {};
  const config: RequestInit = {
    method: requestOptions.method || "GET", // Default to GET if not provided
    headers,
    ...requestOptions,
  };

  if (body && config.method !== "GET" && config.method !== "HEAD") {
    // If body is FormData, pass it directly. Otherwise, stringify it.
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${MAIN_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.message || "Something went wrong", response.status);
  }

  return response.json();
}
