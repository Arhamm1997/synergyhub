export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  status: 'success',
  message,
  data
});

export const errorResponse = (message: string, errors?: string[]): ApiResponse => ({
  status: 'error',
  message,
  errors
});