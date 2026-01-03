/**
 * Wspólne typy używane w całej aplikacji
 */
export interface ApiError {
  message: string
  statusCode?: number
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}
