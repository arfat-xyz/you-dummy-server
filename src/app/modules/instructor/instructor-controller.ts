import { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";
import catchAsync from "../../../shared/cacheAsync";
import sendResponse from "../../../shared/sentResponse";
import { IUser } from "../auth/auth-interface";
import { InstructorService } from "./instructor-service";
const makeInstructor = catchAsync(async (req: Request, res: Response) => {
  const result = await InstructorService.makeInstructor(req.body);
  sendResponse<string>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Great! Now you can login with your new password`,
    data: result,
  });
});
const getAccountStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await InstructorService.getAccountStatus(req.body);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Account status retrive successfull`,
    data: result,
  });
});
const studentCount = catchAsync(async (req: Request, res: Response) => {
  const result = await InstructorService.studentCount(req.body);
  sendResponse<IUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Students found successfull`,
    data: result,
  });
});
const instructorBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await InstructorService.instructorBalance(req?.auth);
  sendResponse<Stripe.Response<Stripe.Balance>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Instructor balance found`,
    data: result,
  });
});
const payoutSettigs = catchAsync(async (req: Request, res: Response) => {
  const result = await InstructorService.payoutSettigs(req?.auth);
  sendResponse<string>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Instructor balance found`,
    data: result,
  });
});
export const InstructorController = {
  makeInstructor,
  getAccountStatus,
  studentCount,
  instructorBalance,
  payoutSettigs,
};
