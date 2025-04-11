import { Router } from "express";
import { requireSignin } from "../../middlewares/authorization-middleware";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
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
export const InstructorRouter = router;
