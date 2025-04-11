import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../../../config";
import ApiError from "../../../errors/ApiError";
import { sendEmailViaNodemailer } from "../../../utils/nodemailer";
import { resetPasswordTemplate } from "../../../utils/templates";
import { ITokenUser } from "./auth-interface";
import { UserModel } from "./auth-schema";
import { comparePassword, hashPassword } from "./auth-utils";
import { userZodSchema } from "./auth-zod-validation";
type CreateUserInput = z.infer<typeof userZodSchema.createUser>;
type LoginUserInput = z.infer<typeof userZodSchema.login>;
const createUser = async (payload: CreateUserInput) => {
  const { email, name, password } = payload;

  const userExist = await UserModel.findOne({ email }).exec();
  if (userExist?.id) throw new ApiError(400, "User already exist");
  const hashedPassword = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });
  if (!user) {
    throw new ApiError(400, "Cow not created");
  }
  const result = await UserModel.findById(user.id, { password: 0 });
  return result;
};

const loginUser = async (payload: LoginUserInput) => {
  const { email, password } = payload;

  // check if out db has user with that email
  const user = await UserModel.findOne({ email }).lean();
  if (!user?._id) throw new ApiError(400, "User not exist");
  // checking password
  const match = await comparePassword(password, user?.password);
  if (!match) {
    throw new ApiError(400, "Email and password not match");
  }

  // return user and token to client, exclude hashed password
  user.password = "";

  // create signed jwt
  const token = jwt.sign(
    { _id: user?._id, role: user.role, email: user?.role, name: user?.name },
    config.jwtSecret as string,
    {
      expiresIn: "10d",
    },
  );
  return { ...user, token };
};

const getCurrentUser = async (payload: ITokenUser | null) => {
  if (!payload?._id) {
    throw new ApiError(404, "User not found");
  }
  const user = await UserModel.findById(payload?._id)
    .select("-password")
    .lean();
  if (!user?._id) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
const sendTestEmail = async () => {
  sendEmailViaNodemailer({
    subject: "Reset Password",
    template: resetPasswordTemplate(),
  });
  return true;
};
export const AuthService = {
  createUser,
  loginUser,
  getCurrentUser,
  sendTestEmail,
};
