import { z } from "zod";
import { stringValidation } from "../../../interface/zod-contants";
// Strong password validation regex patterns
const passwordSchema = (fieldName: string = "Password") =>
  stringValidation(fieldName).min(8, {
    message: "Password must be at least 8 characters long",
  });
// .regex(/[A-Z]/, {
//   message: "Password must contain at least one uppercase letter",
// })
// .regex(/[a-z]/, {
//   message: "Password must contain at least one lowercase letter",
// })
// .regex(/[0-9]/, { message: "Password must contain at least one number" })
// .regex(/[!@#$%^&*(),.?":{}|<>]/, {
//   message: "Password must contain at least one special character",
// })
// .refine((val) => !/\s/.test(val), {
//   message: "Password must not contain spaces",
// });

const createUser = z.object({
  name: z.string().min(1, {
    message: `Name is required`,
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema(),
});
const login = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema(),
});
const forgetPasswordEmailValidation = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
export type IForgetPasswordEmailValidation = z.infer<
  typeof forgetPasswordEmailValidation
>;

const resetPassword = z.object({
  email: stringValidation("Email").email({ message: "Invalid email address" }),
  newPassword: passwordSchema("New Password"),
  code: stringValidation("Code"),
});

// Define types for form data
export type IResetPassword = z.infer<typeof resetPassword>;

export const userZodSchema = {
  createUser,
  login,
  forgetPasswordEmailValidation,
  resetPassword,
};
