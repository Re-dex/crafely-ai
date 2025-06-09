export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;

  private constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: any
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, error: any): ApiResponse {
    return new ApiResponse(false, message, undefined, error);
  }
}
