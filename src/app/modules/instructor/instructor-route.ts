import { Router } from "express";
import {
  isInstructor,
  requireSignin,
} from "../../middlewares/authorization-middleware";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
import { CourseZodValidation } from "../course/course-zod-validation";
import { InstructorController } from "./instructor-controller";
import { InstructorZodSchema } from "./instructor-zod-validation";

const router = Router();

router.post(
  "/make-instructor",
  requireSignin,
  zodValidateRequest(InstructorZodSchema.makeInstructor),
  InstructorController.makeInstructor,
);
router.post(
  "/get-account-status",
  zodValidateRequest(InstructorZodSchema.instructorUserZod),
  requireSignin,
  InstructorController.getAccountStatus,
);

router.get(
  "/balance",
  requireSignin,
  isInstructor,
  InstructorController.instructorBalance,
);
router.get(
  "/payout-settings",
  requireSignin,
  isInstructor,
  InstructorController.payoutSettigs,
);

router.post(
  "/student-count",
  zodValidateRequest(CourseZodValidation.courseIdZodValidation),
  requireSignin,
  InstructorController.studentCount,
);
export const InstructorRouter = router;
