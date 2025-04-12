import mongoose from "mongoose";

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
  instructor: mongoose.Types.ObjectId;
  lessons: ILesson[];
};

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
