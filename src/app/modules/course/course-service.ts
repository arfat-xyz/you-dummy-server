import mongoose, { SortOrder } from "mongoose";
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
  IReview,
} from "./course-interface";
import { CompletedModel, CourseModel, ReviewModel } from "./course-schema";
import { courseSearchableFields } from "./course-utils";
import {
  ICourseID,
  ICourseIDWithLessonID,
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
const listCompleted = async (payload: ICourseID, user: ITokenUser) => {
  const list = await CompletedModel.findOne({
    user: user?._id,
    course: payload?.courseId,
  }).exec();

  return list?.lessons;
};
const lessonMarkAsCompleted = async (
  payload: ICourseIDWithLessonID,
  user: ITokenUser,
) => {
  const { courseId, lessonId } = payload;
  // find if user with that course is already created
  const courseAlreadyEsixtInCompleteList = await CompletedModel.findOne({
    user: user?._id,
    course: courseId,
  }).exec();
  if (courseAlreadyEsixtInCompleteList?._id) {
    const updated = await CompletedModel.findOneAndUpdate(
      {
        user: user?._id,
        course: courseId,
      },
      {
        $addToSet: { lessons: lessonId },
      },
    ).exec();
    return updated;
  } else {
    const created = await new CompletedModel({
      user: user?._id,
      course: courseId,
      lessons: [lessonId],
    }).save();
    return created;
  }
};
const lessonMarkAsIncompleted = async (
  payload: ICourseIDWithLessonID,
  user: ITokenUser,
) => {
  const { courseId, lessonId } = payload;
  // find if user with that course is already created
  const updated = await CompletedModel.findOneAndUpdate(
    {
      user: user?._id,
      course: courseId,
    },
    {
      $pull: { lessons: lessonId },
    },
  ).exec();
  return updated;
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
  }

  andCondition.push({ published: true });

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // Step 1: Fetch paginated courses
  const courses = await CourseModel.find(whereCondition)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .populate("instructor", "_id name")
    .lean();

  // Step 2: Get average ratings and number of ratings grouped by course
  const courseIds = courses.map(course => course._id);
  const ratings = await ReviewModel.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  // Step 3: Map courseId => rating data
  const ratingMap = new Map(
    ratings.map(r => [
      r._id.toString(),
      {
        averageRating: r.averageRating,
        numberOfRatings: r.numberOfRatings,
      },
    ]),
  );

  // Step 4: Attach averageRating + numberOfRatings to each course
  const coursesWithRatings = courses.map(course => {
    const ratingInfo = ratingMap.get(course._id.toString()) || {
      averageRating: 0,
      numberOfRatings: 0,
    };
    return {
      ...course,
      averageRating: ratingInfo.averageRating,
      numberOfRatings: ratingInfo.numberOfRatings,
    };
  });

  // Step 5: Total count for pagination
  const total = await CourseModel.countDocuments(whereCondition);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: coursesWithRatings,
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
    .lean();
  const reviews = await ReviewModel.find({
    course: course?._id,
  })
    .populate("user", "name picture")
    .lean();
  if (!course?._id) throw new ApiError(404, "Course not found");
  console.log({ reviews: reviews[0].user });
  return { ...course, reviews };
};
const userSingleCourse = async (slug: string, user: ITokenUser | null) => {
  if (!slug) throw new ApiError(404, "Slug is requried");

  const course = await CourseModel.findOne({ slug })
    .populate("instructor", "_id name")
    .lean();
  if (!course?._id) throw new ApiError(404, "Course not found");

  const dbUser = await UserModel.findById(user?._id).exec();
  if (!dbUser?.courses.includes(course?._id)) {
    throw new ApiError(403, "You're not authorized");
  }
  const existCourseReview = await ReviewModel.exists({
    course: course?._id,
    user: user?._id,
  });
  return { ...course, userAlreadyReviewd: !!existCourseReview?._id };
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
const createReview = async (
  payload: IReview,
  params: ICourseID,
  user: ITokenUser,
) => {
  const { courseId } = params;
  const userExist = await UserModel.findById(user?._id)
    .select("courses")
    .exec();
  if (
    !userExist?._id ||
    !userExist?.courses.includes(new mongoose.Types.ObjectId(courseId))
  ) {
    throw new ApiError(400, "Unauthorized");
  }
  const existCourseReview = await ReviewModel.findOne({
    course: courseId,
    user: user?._id,
  });
  if (existCourseReview) throw new ApiError(403, "Already reviewed");
  const created = await new ReviewModel({
    user: user?._id,
    course: courseId,
    comment: payload.comment,
    rating: payload.rating,
  }).save();
  return created;
};

export const CourseService = {
  createCourse,
  listCompleted,
  lessonMarkAsCompleted,
  lessonMarkAsIncompleted,
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
  createReview,
};
