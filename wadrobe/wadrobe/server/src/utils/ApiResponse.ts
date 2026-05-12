/**
 * Standard API Response structure.
 */
export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T | undefined;

  constructor(success: boolean, message: string, data: T | undefined = undefined) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message: string = 'Success') {
    return new ApiResponse(true, message, data);
  }

  static error(message: string = 'Error occurred') {
    return new ApiResponse(false, message);
  }
}
