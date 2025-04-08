import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth-route";

const router = Router();
const modulesRoute = [
  {
    path: "/auth",
    route: AuthRouter,
  },
];
modulesRoute.filter(mR => router.use(mR.path, mR.route));
export default router;
