export default class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string | undefined,
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
