import ApiError from "../../../errors/ApiError";
import { stripe } from "../../../utils/stripe";
import { ITokenUser } from "../auth/auth-interface";
import { UserModel } from "../auth/auth-schema";
import { ICourseID } from "../course/course-zod-validation";
import {
  IInstructorUserProps,
  IMakeInstructorProps,
} from "./instructor-zod-validation";

const makeInstructor = async ({ _id }: IMakeInstructorProps) => {
  // 1.   Find user from db
  const user = await UserModel.findById(_id).exec();

  if (!user?.id) {
    throw new ApiError(409, "User not found");
  }

  // 2.   If user doesn't have stripe_account_id yet, then create new
  if (!user?.stripe_account_id) {
    const account = await stripe.accounts.create({ type: "express" });
    user.stripe_account_id = account.id;
    user.save();
  }

  // 3.   Create account link based on account id (for frontend to complete Onboarding)
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });

  // 4.   pre-fill any info such as email(optional), then send url response to frontend
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email,
  });
  const urlParams = new URLSearchParams(accountLink as never);
  urlParams.set("stripe_user[email]", user.email);
  return `${accountLink.url}?${urlParams.toString()}`;
};
const getAccountStatus = async (payload: IInstructorUserProps) => {
  const user = await UserModel.findById(payload._id).exec();
  if (!user?.id) {
    throw new ApiError(409, "User not found");
  }
  const account = await stripe.accounts.retrieve(user.stripe_account_id);

  if (!account.charges_enabled) {
    throw new ApiError(401, "Unauthorized");
  }
  const statusUpdated = await UserModel.findByIdAndUpdate(
    user._id,
    {
      stripe_seller: account,
      $addToSet: { role: "Instructor" },
    },
    {
      new: true,
    },
  )
    .select("-password")
    .lean();
  // console.log("statusUpdated", statusUpdated);

  return statusUpdated;
};
const studentCount = async (payload: ICourseID) => {
  const users = await UserModel.find({ courses: payload?.courseId })
    // .select("_id")
    .exec();
  return users;
};
const instructorBalance = async (user: ITokenUser | null) => {
  const dbUser = await UserModel.findById(user?._id).exec();
  if (!dbUser?._id) {
    throw new ApiError(409, "User not found");
  }
  const balance = await stripe.balance.retrieve({
    stripeAccount: dbUser.stripe_account_id,
  });
  return balance;
};
const payoutSettigs = async (user: ITokenUser | null) => {
  const dbUser = await UserModel.findById(user?._id).exec();
  if (!dbUser?.stripe_seller?.id) {
    throw new ApiError(409, "User not found");
  }
  const loginLink = await stripe.accounts.createLoginLink(
    dbUser?.stripe_seller?.id as string,
    // { redirect_url: process.env.STRIPE_SETTINGS_REDIRECT as string },
  );
  return loginLink.url;
};

export const InstructorService = {
  makeInstructor,
  getAccountStatus,
  studentCount,
  instructorBalance,
  payoutSettigs,
};
