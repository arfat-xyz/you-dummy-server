import { SortOrder } from "mongoose";
import slugify from "slugify";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { stripe } from "../../../utils/stripe";
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
  ICourseID,
  ICreateCourse,
  ILessionCreate,
  ILessionUPdate,
  IPublishOrUnpublish,
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
const freeEnrollment = async (payload: ICourseID, user: ITokenUser) => {
  const course = await CourseModel.findById(payload?.courseId).exec();
  if (!course?._id) throw new ApiError(404, "Course not found");
  if (course?.paid) throw new ApiError(409, "This course is paid");

  await UserModel.findByIdAndUpdate(
    user?._id,
    {
      $addToSet: { courses: course?._id },
    },
    { new: true },
  ).exec();
  return course;
};
const paidEnrollment = async (payload: ICourseID, user: ITokenUser) => {
  const { courseId } = payload;

  const course = await CourseModel.findById(courseId)
    .populate("instructor")
    .exec();
  if (!course) throw new ApiError(404, "Course not found");
  if (!course.paid) throw new ApiError(409, "This course is free");

  const fee = (course.price * 30) / 100;
  if (
    typeof course.instructor !== "object" ||
    !("stripe_account_id" in course.instructor)
  ) {
    throw new ApiError(400, "Instructor Stripe account not connected");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: course.name,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.round(fee * 100),
      transfer_data: {
        destination: course?.instructor?.stripe_account_id as string,
      },
    },
    mode: "payment",
    success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
    cancel_url: process.env.STRIPE_CANCEL_URL!,
  });
  const newUser = await UserModel.findByIdAndUpdate(
    user._id,
    {
      stripeSession: session,
    },
    {
      new: true,
    },
  ).exec();
  console.log({ newUser });
  return session?.id;
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
const coursesForAll = async (
  paginationOptions: IPaginationOptions,
  filters: ICourseFilters,
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
    published: true,
  });
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const result = await CourseModel.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .populate("instructor", "_id name")
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
const userCourses = async (
  paginationOptions: IPaginationOptions,
  filters: ICourseFilters,
  user: ITokenUser | null,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersFields } = filters;

  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  // ✅ Find the user's enrolled course IDs
  const dbUser = await UserModel.findById(user?._id).select("courses").exec();
  const enrolledCourseIds = dbUser?.courses || [];
  const andCondition = [];

  // ✅ Filter by user's enrolled courses
  andCondition.push({
    _id: { $in: enrolledCourseIds },
  });

  // ✅ Search filter
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

  // ✅ Field filters
  if (Object.keys(filtersFields).length) {
    andCondition.push({
      $and: Object.entries(filtersFields).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  const result = await CourseModel.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .populate("instructor", "_id name");

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
const userSingleCourse = async (slug: string, user: ITokenUser | null) => {
  if (!slug) throw new ApiError(404, "Slug is requried");

  const course = await CourseModel.findOne({ slug })
    .populate("instructor", "_id name")
    .exec();
  if (!course?._id) throw new ApiError(404, "Course not found");

  const dbUser = await UserModel.findById(user?._id).exec();
  if (!dbUser?.courses.includes(course?._id)) {
    throw new ApiError(403, "You're not authorized");
  }

  return course;
};
const checkEnrollment = async (
  { courseId }: ICourseID,
  auth: ITokenUser | null,
) => {
  if (!auth?._id) {
    throw new Error("Unauthorized or invalid user.");
  }

  // find courses of the currently logged in user
  const user = await UserModel.findById(auth._id).exec();
  const ids: string[] =
    user?.courses?.map(courseId => courseId.toString()) || [];
  return {
    status: ids.includes(courseId),
  };
};
const stripeSuccess = async (
  { courseId }: ICourseID,
  auth: ITokenUser | null,
) => {
  // Find course
  const course = await CourseModel.findById(courseId).exec();
  if (!course) throw new ApiError(404, "Course not found");

  // Get user
  const user = await UserModel.findById(auth?._id).exec();
  if (!user) throw new ApiError(404, "User not found");

  if (user?.courses.includes(new mongoose.Types.ObjectId(courseId))) {
    return course;
    // already enrolled
  }

  // Extract Stripe session ID
  const sessionId = (user.stripeSession as { id?: string })?.id;

  if (!sessionId || typeof sessionId !== "string") {
    throw new ApiError(400, "Stripe session ID not found or invalid");
  }

  // Retrieve Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  // If session is paid, add course to user's courses and clear session
  if (session.payment_status === "paid") {
    await UserModel.findByIdAndUpdate(user._id, {
      $addToSet: { courses: course._id },
      $set: { stripeSession: {} },
    }).exec();
  }

  return course;
};

const addLesson = async (
  params: ICreateLessionParams,
  payload: ILessionCreate,
  auth: ITokenUser | null,
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

import mongoose from "mongoose";

const updateCourse = async (payload: IUpdateCourse, instructor: ITokenUser) => {
  payload.slug = slugify(payload.slug);
  const course = await CourseModel.findById(payload?.id).exec();

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Ensure instructor is ObjectId before using .equals()
  if (
    !(
      course.instructor instanceof mongoose.Types.ObjectId &&
      course.instructor.equals(instructor._id)
    )
  ) {
    throw new ApiError(403, "Unauthorized access");
  }

  // If slug changed, check if it's taken by another course
  if (payload.slug !== course.slug) {
    const slugTaken = await CourseModel.findOne({
      slug: payload.slug,
      _id: { $ne: payload.id },
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

const publishOrUnpublish = async (
  payload: IPublishOrUnpublish,
  instructor: ITokenUser,
) => {
  const { courseId, published } = payload;
  const course = await CourseModel.findById(courseId)
    .select("instructor")
    .lean();
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (String(instructor._id) !== String(course.instructor)) {
    throw new ApiError(403, "Unauthorized");
  }

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    courseId,
    { published },
    { new: true },
  )
    .populate("instructor", "_id name")
    .exec();
  if (!updatedCourse) {
    throw new ApiError(400, "Failed to publish course");
  }

  return updatedCourse;
};

export const CourseService = {
  createCourse,
  instructorAllCourses,
  coursesForAll,
  userCourses,
  singleCourse,
  userSingleCourse,
  freeEnrollment,
  paidEnrollment,
  checkEnrollment,
  stripeSuccess,
  addLesson,
  updateLesson,
  removeLession,
  updateCourse,
  publishOrUnpublish,
};
