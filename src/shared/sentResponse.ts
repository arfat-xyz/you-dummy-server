import { Response } from "express";
type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  } | null;
  data: T | null;
};
const sendResponse = <T>(res: Response, funData: IApiResponse<T>): void => {
  const { statusCode, success, message, data, meta } = funData;
  const responseData: IApiResponse<T> = {
    statusCode,
    message: message || null,
    success,
    meta: meta || null,
    data: data || null,
  };
  res.status(statusCode).json(responseData);
};
export default sendResponse;
