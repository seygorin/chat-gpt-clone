export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ApiError).message === 'string' &&
    typeof (obj as ApiError).code === 'string'
  );
}

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ApiResponse<T>).success === 'boolean' &&
    'data' in obj
  );
}
