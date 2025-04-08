import { Router } from "express";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
import { AuthController } from "./auth-controller";
import { userZodSchema } from "./auth-zod-validation";

const router = Router();

router.post(
  "/register",
  zodValidateRequest(userZodSchema.createUser),
  AuthController.createUser,
);

export const AuthRouter = router;
