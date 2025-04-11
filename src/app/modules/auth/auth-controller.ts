import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/cacheAsync";
import sendResponse from "../../../shared/sentResponse";
import { IUser } from "./auth-interface";
import { AuthService } from "./auth-service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.createUser(req.body);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User created successfully.`,
    data: result,
  });
});
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { token, ...loginUser } = result;

  //  send token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS-only in production
  });
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User login successfully.`,
    data: loginUser,
  });
});
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  //  remove token from cookie
  res.clearCookie("token");
  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User login successfully.`,
    data: null,
  });
});
const currentUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getCurrentUser(req.auth);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User found successfully.`,
    data: result,
  });
});
const sendTestEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.sendTestEmail();
  sendResponse<boolean>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Email send successfully.`,
    data: result,
  });
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body);
  sendResponse<string>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Check your email for the secret code`,
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Great! Now you can login with your new password`,
    data: result,
  });
});
export const AuthController = {
  createUser,
  loginUser,
  logoutUser,
  currentUser,
  sendTestEmail,
  forgetPassword,
  resetPassword,
};
