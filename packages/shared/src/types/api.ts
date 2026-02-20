export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CursorPaginatedResponse<T> = {
  items: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
  };
  tokens: AuthTokens;
};
