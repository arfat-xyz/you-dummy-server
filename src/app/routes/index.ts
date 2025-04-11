import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth-route";
import { InstructorRouter } from "../modules/instructor/instructor-route";

const router = Router();
const modulesRoute = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/instructor",
    route: InstructorRouter,
  },
];
modulesRoute.filter(mR => router.use(mR.path, mR.route));
export default router;
