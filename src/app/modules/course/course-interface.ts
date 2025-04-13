import mongoose from "mongoose";
import { IUser } from "../auth/auth-interface";

// Define the interface for a Lesson
export type ILesson = {
  title: string;
  slug: string;
  content: string;
  video?: string;
  free_preview: boolean;
};

// Define the interface for a Course
export type ICourse = {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  published: boolean;
  paid: boolean;
  instructor: mongoose.Types.ObjectId | IUser;
  lessons: ILesson[];
};

export type ICompleted = {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lessons: mongoose.Types.ObjectId[]; // or string[] if lesson IDs are strings
  createdAt: Date;
  updatedAt: Date;
} & Document;

export type ICreateLessionParams = { slug: string; instructorId: string };
export type IRemoveLessionParams = {
  lessionID: string;
} & ICreateLessionParams;

export type ICourseFilters = {
  name?: string;
  slug?: string;
  category?: string;
  searchTerm?: string;
};
