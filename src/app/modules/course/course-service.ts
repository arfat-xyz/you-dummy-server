import { SortOrder } from "mongoose";
import slugify from "slugify";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { ITokenUser } from "../auth/auth-interface";
import { UserModel } from "../auth/auth-schema";
import {
  ICourseFilters,
  ICreateLessionParams,
  ILesson,
  IRemoveLessionParams,
} from "./course-interface";
import { CourseModel } from "./course-schema";
import { courseSearchableFields } from "./course-utils";
import {
  ICreateCourse,
  ILessionCreate,
  ILessionUPdate,
  IUpdateCourse,
} from "./course-zod-validation";

const createCourse = async (payload: ICreateCourse, instructor: ITokenUser) => {
  payload.slug = slugify(payload.slug);
  const alreadyExist = await CourseModel.findOne({
    slug: payload.slug,
  });
  const userExist = await UserModel.findById(instructor?._id).lean();
  if (!userExist?._id) throw new ApiError(403, "User doesn't exist");

  if (alreadyExist) throw new ApiError(400, "Slug is taken");

  const course = await new CourseModel({
    ...payload,
    instructor: instructor._id,
  }).save();
  return course;
};

const instructorAllCourses = async (
  paginationOptions: IPaginationOptions,
  filters: ICourseFilters,
  instructor: ITokenUser,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);
  const { searchTerm, ...filtersFields } = filters;
  const sortCondition: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: courseSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersFields).length) {
    andCondition.push({
      $and: Object.entries(filtersFields).map(([field, value]) => ({
        [field]: value,
      })),
    });
  } // ✅ Add instructor filter
  andCondition.push({
    instructor: instructor._id,
  });
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const result = await CourseModel.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await CourseModel.countDocuments(whereCondition);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const singleCourse = async (slug: string) => {
  if (!slug) throw new ApiError(404, "Slug is requried");
  const course = await CourseModel.findOne({ slug })
    .populate("instructor", "_id name")
    .exec();
  if (!course?._id) throw new ApiError(404, "Course not found");
  return course;
};
const addLesson = async (
  params: ICreateLessionParams,
  payload: ILessionCreate,
  auth?: ITokenUser | null,
) => {
  const { slug, instructorId } = params;
  const { title, content, video } = payload;

  if (!slug) throw new ApiError(404, "Slug is requried");
  if (auth?._id !== instructorId) throw new ApiError(400, "unauthorized");
  const course = await CourseModel.findOne({ slug })
    .populate("instructor", "_id name")
    .exec();
  if (!course?._id) throw new ApiError(404, "Course not found");

  const updated = await CourseModel.findOneAndUpdate(
    { slug },
    {
      $push: { lessons: { title, video, content, slug: slugify(title) } },
    },
    { new: true },
  )
    .populate("instructor", "_id name")
    .exec();
  return updated;
};
const updateLesson = async (
  params: ICreateLessionParams,
  payload: ILessionUPdate,
  auth?: ITokenUser | null,
): Promise<ILesson[]> => {
  const { slug } = params;
  const { id, title, content, video, free_preview } = payload;

  if (!slug || !id) {
    throw new ApiError(400, "Missing required parameters");
  }

  const course = await CourseModel.findOne({ slug }).select("instructor _id");
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (String(auth?._id) !== String(course.instructor)) {
    throw new ApiError(403, "Unauthorized");
  }

  const updatedCourse = await CourseModel.findOneAndUpdate(
    { slug, "lessons._id": id },
    {
      $set: {
        "lessons.$.title": title,
        "lessons.$.content": content,
        "lessons.$.video": video,
        "lessons.$.free_preview": free_preview ?? false,
      },
    },
    { new: true },
  ).populate("instructor", "_id name");

  if (!updatedCourse?.lessons) {
    throw new ApiError(400, "Failed to update lesson or lesson not found");
  }

  return updatedCourse?.lessons;
};

const removeLession = async (
  params: IRemoveLessionParams,
  auth?: ITokenUser | null,
) => {
  const { slug, instructorId, lessionID } = params;

  if (!slug || !lessionID || !instructorId) {
    throw new ApiError(400, "Required parameters are missing");
  }

  // Find course with just the needed fields to reduce payload
  const course = await CourseModel.findOne({ slug })
    .select("_id instructor")
    .lean();
  if (!course) throw new ApiError(404, "Course not found");

  if (auth?._id !== String(instructorId)) {
    throw new ApiError(403, "Unauthorized access");
  }

  // Remove lesson from course
  const updatedCourse = await CourseModel.findByIdAndUpdate(
    course._id,
    { $pull: { lessons: { _id: lessionID } } },
    { new: true },
  );

  if (!updatedCourse) {
    throw new ApiError(500, "Failed to update course");
  }

  return updatedCourse.lessons;
};

const updateCourse = async (payload: IUpdateCourse, instructor: ITokenUser) => {
  payload.slug = slugify(payload.slug);
  const course = await CourseModel.findById(payload?.id).exec();

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check ownership
  if (!course.instructor.equals(instructor._id)) {
    throw new ApiError(403, "Unauthorized access");
  }

  // If slug changed, check if it's taken by another course
  if (payload.slug !== course.slug) {
    const slugTaken = await CourseModel.findOne({
      slug: payload.slug,
      _id: { $ne: payload.id }, // ensure it's not the same course
    });

    if (slugTaken) {
      throw new ApiError(400, "Slug is already taken by another course");
    }
  }

  const updated = await CourseModel.findByIdAndUpdate(payload.id, payload, {
    new: true,
  }).exec();
  return updated;
};

export const CourseService = {
  createCourse,
  instructorAllCourses,
  singleCourse,
  addLesson,
  updateLesson,
  removeLession,
  updateCourse,
};
