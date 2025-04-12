import { NextFunction, Request, Response } from "express";
import { expressjwt } from "express-jwt";
import { config } from "../../config";
import ApiError from "../../errors/ApiError";
import { UserModel } from "../modules/auth/auth-schema";
export const requireSignin = expressjwt({
  getToken: (req: Request) => {
    return req.cookies.token;
  },
  secret: config.jwtSecret as string,
  algorithms: ["HS256"],
});

export const isInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await UserModel.findById(req?.auth?._id).exec();
    if (!user || !user.role.includes("Instructor")) {
      throw new ApiError(403, "User is not authorized");
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
};
