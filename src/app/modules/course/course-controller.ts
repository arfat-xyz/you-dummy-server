import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/cacheAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sentResponse";
import {
  ICourse,
  ICreateLessionParams,
  ILesson,
  IRemoveLessionParams,
} from "./course-interface";
import { CourseService } from "./course-service";
import { ICourseID } from "./course-zod-validation";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body, req.auth!);
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course created successfully.`,
    data: result,
  });
});
const freeEnrollment = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.freeEnrollment(
    req.params as ICourseID,
    req.auth!,
  );
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course enrolled successfully.`,
    data: result,
  });
});
const instructorAllCourses = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields);
  const result = await CourseService.instructorAllCourses(
    req.query,
    paginationOptions,
    req.auth!,
  );

  sendResponse<ICourse[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Courses found successfully.`,
    meta: result.meta,
    data: result.data,
  });
});
const coursesForAll = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields);
  const result = await CourseService.coursesForAll(
    req.query,
    paginationOptions,
  );

  sendResponse<ICourse[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Courses found successfully.`,
    meta: result.meta,
    data: result.data,
  });
});
const singleCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.singleCourse(req?.params?.slug);
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course created successfully.`,
    data: result,
  });
});
const checkEnrollment = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.checkEnrollment(
    req?.params as ICourseID,
    req.auth,
  );
  sendResponse<{ status: boolean }>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course created successfully.`,
    data: result,
  });
});
const addLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.addLesson(
    req?.params as ICreateLessionParams,
    req.body,
    req?.auth,
  );
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course created successfully.`,
    data: result,
  });
});
const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.updateLesson(
    req?.params as ICreateLessionParams,
    req.body,
    req?.auth,
  );
  sendResponse<ILesson[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Lession updated successfully.`,
    data: result,
  });
});
const removeLession = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.removeLession(
    req?.params as IRemoveLessionParams,
    req?.auth,
  );
  sendResponse<ILesson[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course created successfully.`,
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.updateCourse(req.body, req.auth!);
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Course updated successfully.`,
    data: result,
  });
});
const publishOrUnpublish = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.publishOrUnpublish(req.body, req.auth!);
  sendResponse<ICourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result?.published
      ? `Course publised successfully.`
      : `Course unpublished successfully.`,
    data: result,
  });
});
export const CourseController = {
  createCourse,
  instructorAllCourses,
  coursesForAll,
  singleCourse,
  checkEnrollment,
  addLesson,
  updateLesson,
  removeLession,
  updateCourse,
  publishOrUnpublish,
  freeEnrollment,
};
