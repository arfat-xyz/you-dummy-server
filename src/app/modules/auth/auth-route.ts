import { Router } from "express";
import { requireSignin } from "../../middlewares/authorization-middleware";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
import { AuthController } from "./auth-controller";
import { userZodSchema } from "./auth-zod-validation";

const router = Router();

router.post(
  "/register",
  zodValidateRequest(userZodSchema.createUser),
  AuthController.createUser,
);
router.post(
  "/login",
  zodValidateRequest(userZodSchema.login),
  AuthController.loginUser,
);
router.get("/logout", AuthController.logoutUser);
router.get("/current-user", requireSignin, AuthController.currentUser);
router.get("/send-test-email", AuthController.sendTestEmail);

export const AuthRouter = router;
