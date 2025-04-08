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
export const AuthController = { createUser };
