import { Schema, model } from "mongoose";
import { IUser, IUserModel } from "./auth-interface";

const { ObjectId } = Schema;

// Define user schema
const userSchema = new Schema<IUser>(
  {
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 64,
    },
    picture: {
      type: String,
      default: "https://i.ibb.co.com/HYf5r66/arfat-rahman-21.jpg",
    },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Instructor", "Admin"],
    },
    stripe_account_id: {
      type: String,
      default: "",
    },
    stripe_seller: {
      type: Object,
      default: {},
    },
    stripeSession: {
      type: Object,
      default: {},
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    passwordResetCode: {
      type: String,
      default: "",
    },
    courses: [
      {
        type: ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true },
);

// Create and export the User model with the IUser interface
export const UserModel = model<IUser, IUserModel>("User", userSchema);
