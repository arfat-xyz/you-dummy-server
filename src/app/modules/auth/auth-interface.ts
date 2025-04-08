import mongoose, { Model } from "mongoose";

// Define the course interface for reference
export type ICourse = {
  // Define course fields here, based on what you need
  title: string;
  description: string;
  // add other course fields as needed
};

export type IUser = {
  password: string;
  picture: string;
  role: string[];
  stripe_account_id: string;
  stripe_seller: Record<string, unknown>;
  stripeSession: Record<string, unknown>;
  name: string;
  email: string;
  passwordResetCode: {
    data: string;
  };
  courses: mongoose.Types.ObjectId[]; // Reference to courses
};

export type IUserModel = Model<IUser>;
