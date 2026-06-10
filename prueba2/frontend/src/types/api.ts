export interface ApiError {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
