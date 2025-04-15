import { z } from "zod";
import {
  booleanValidation,
  stringValidation,
} from "../../../interface/zod-contants";

const createCourse = z
  .object({
    name: stringValidation("Name").min(1, "Course name is required"),
    slug: stringValidation("Slug").min(1, "Slug is required"),
    description: stringValidation("Description").min(
      20,
      "Description should be at least 20 characters",
    ),
    image: stringValidation("Image")
      .url("Image must be a valid URL")
      .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "Must be an image URL"),
    paid: booleanValidation("Paid"),
    published: booleanValidation("Published").default(false), // ✅ default to false
    price: stringValidation("Price").refine(val => !isNaN(parseFloat(val)), {
      message: "Price must be a valid number",
    }),
  })
  .refine(
    data => {
      if (!data.paid && parseFloat(data.price) !== 0) {
        return false;
      }
      return true;
    },
    {
      path: ["price"],
      message: "Price must be 0.00 if the course is not paid",
    },
  );
export const lessionCreateZodValidation = z.object({
  title: stringValidation("Title").min(
    3,
    "Title must be at least 3 characters",
  ),
  slug: stringValidation("Slug"),
  instructorId: stringValidation("Instructor ID"),
  content: stringValidation("Content").min(
    10,
    "Content must be at least 10 characters",
  ),
  video: stringValidation("Video").url("Must be a valid video URL"),
  free_preview: z.boolean().optional().default(false),
});
export const lessonUpdateZod = lessionCreateZodValidation.extend({
  id: stringValidation("ID"),
});
const updateCourse = z
  .object({
    name: stringValidation("Name").min(1, "Course name is required"),
    slug: stringValidation("Slug").min(1, "Slug is required"),
    id: stringValidation("Course ID").min(1, "Course ID is required"),
    description: stringValidation("Description").min(
      20,
      "Description should be at least 20 characters",
    ),
    lessons: z
      .array(
        z.object({
          title: stringValidation("Lesson Title"),
          slug: stringValidation("Lesson Slug"),
          content: stringValidation("Lesson Content"),
          video: z.string().url("Video must be a valid URL").optional(),
        }),
      )
      .optional(),
    image: stringValidation("Image")
      .url("Image must be a valid URL")
      .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "Must be an image URL"),
    category: stringValidation("Category").min(1, "Category is required"),
    paid: booleanValidation("Paid"),
    published: booleanValidation("Published").default(false), // ✅ default to false
    price: stringValidation("Price").refine(val => !isNaN(parseFloat(val)), {
      message: "Price must be a valid number",
    }),
  })
  .refine(
    data => {
      if (!data.paid && parseFloat(data.price) !== 0) {
        return false;
      }
      return true;
    },
    {
      path: ["price"],
      message: "Price must be 0.00 if the course is not paid",
    },
  );
const publishOrUnpublish = z.object({
  published: booleanValidation("Publish"),
  courseId: stringValidation("Course ID"),
});
const courseIdZodValidation = z.object({
  courseId: stringValidation("Course ID"),
});

const courseIdWithLessonId = courseIdZodValidation.extend({
  lessonId: stringValidation("Lesson ID"),
});

export const reviewValidationSchema = z.object({
  user: stringValidation("User as ID"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: stringValidation("Comment")
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters"),
  course: stringValidation("Course as ID").optional(),
});
// Combined schema for when you need both review data and course ID
export const reviewWithCourseIdValidationSchema = reviewValidationSchema.merge(
  courseIdZodValidation,
);
export type ICreateCourse = z.infer<typeof createCourse>;
export type IUpdateCourse = z.infer<typeof updateCourse>;
export type IPublishOrUnpublish = z.infer<typeof publishOrUnpublish>;
export type ICourseID = z.infer<typeof courseIdZodValidation>;
export type ICourseIDWithLessonID = z.infer<typeof courseIdWithLessonId>;

export type ILessionCreate = z.infer<typeof lessionCreateZodValidation>;
export type ILessionUPdate = z.infer<typeof lessonUpdateZod>;

export const CourseZodValidation = {
  createCourse,
  lessionCreateZodValidation,
  lessonUpdateZod,
  updateCourse,
  publishOrUnpublish,
  courseIdZodValidation,
  courseIdWithLessonId,
  reviewValidationSchema,
  reviewWithCourseIdValidationSchema,
};
