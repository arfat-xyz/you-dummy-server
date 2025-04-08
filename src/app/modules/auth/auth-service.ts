import { z } from "zod";
import ApiError from "../../../errors/ApiError";
import { UserModel } from "./auth-schema";
import { hashPassword } from "./auth-utils";
import { userZodSchema } from "./auth-zod-validation";
type CreateUserInput = z.infer<typeof userZodSchema.createUser>;
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
export const AuthService = { createUser };
