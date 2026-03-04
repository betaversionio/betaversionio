const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

let isRefreshing = false;

/**
 * Check whether the browser has an access_token cookie
 * (set by the backend, non-httpOnly so JS can see it).
 */
export function hasAccessTokenCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith('access_token='));
}

export async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    return res.ok;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Query parameters to append to the URL */
  params?: Record<string, string | number | boolean | undefined>;
  /** Skip the automatic 401 → refresh → retry cycle */
  skipAuthRefresh?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    params,
    headers: customHeaders,
    skipAuthRefresh,
    ...rest
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) ?? {}),
  };

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: 'include',
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.append(key, String(value));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  let res = await fetch(url, config);

  // If unauthorized, attempt a token refresh and retry once
  if (res.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Cookies are updated by the refresh response — just retry
      res = await fetch(url, config);
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    // API wraps errors in { success: false, error: { message, code } }
    const message =
      (errorBody as { error?: { message?: string } }).error?.message ??
      (errorBody as { message?: string }).message ??
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  // Backend wraps all responses in { success, data } — unwrap automatically
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
