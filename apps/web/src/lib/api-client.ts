const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

let accessToken: string | null = null;
let isRefreshing = false;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the automatic 401 → refresh → redirect cycle */
  skipAuthRefresh?: boolean;
}

export async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return false;
    }

    const json = await res.json();
    // Backend wraps responses: { success, data: { user, tokens: { accessToken, refreshToken } } }
    const token = json?.data?.tokens?.accessToken;
    if (token) {
      setAccessToken(token);
      return true;
    }

    return false;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, skipAuthRefresh, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: "include",
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let res = await fetch(`${API_URL}${endpoint}`, config);

  // If unauthorized, attempt a token refresh and retry once
  if (res.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      const retryConfig: RequestInit = {
        ...rest,
        headers,
        credentials: "include",
      };
      if (body !== undefined) {
        retryConfig.body = JSON.stringify(body);
      }
      res = await fetch(`${API_URL}${endpoint}`, retryConfig);
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ??
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
