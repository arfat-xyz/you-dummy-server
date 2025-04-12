import mongoose, { Model, Schema } from "mongoose";
import { ICourse, ILesson } from "./course-interface";

// Define the schema for a Lesson
const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: String,
      minlength: 200,
    },
    video: {
      type: String,
    },
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Define the schema for a Course
const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      minlength: 200,
      required: true,
    },
    price: {
      type: Number,
      default: 9.99,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessons: [lessonSchema],
  },
  { timestamps: true },
);

// Export the typed model
export const CourseModel: Model<ICourse> = mongoose.model<ICourse>(
  "Course",
  courseSchema,
);
