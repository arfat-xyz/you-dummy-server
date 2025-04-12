import mongoose, { Model } from "mongoose";

export type IUser = {
  password: string;
  picture: string;
  role: ["Subscriber" | "Instructor" | "Admin"];
  stripe_account_id: string;
  stripe_seller: Record<string, unknown>;
  stripeSession: Record<string, unknown>;
  name: string;
  email: string;
  passwordResetCode: string;
  courses: mongoose.Types.ObjectId[]; // Reference to courses
};
export type ITokenUser = {
  role: ["Subscriber" | "Instructor" | "Admin"];
  name: string;
  email: string;
  _id: string;
};
export type IUserWithToken = IUser & {
  token: string;
};
export type IUserModel = Model<IUser>;
