import { Router } from "express";
import {
  isInstructor,
  requireSignin,
} from "../../middlewares/authorization-middleware";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
import { CourseController } from "./course-controller";
import { CourseZodValidation } from "./course-zod-validation";

const router = Router();

router.post(
  "/create-course",
  zodValidateRequest(CourseZodValidation.createCourse),
  requireSignin,
  isInstructor,
  CourseController.createCourse,
);
router.get(
  "/instructor-courses",
  requireSignin,
  isInstructor,
  CourseController.instructorAllCourses,
);
router.get("/courses-for-all", CourseController.coursesForAll);
router.post(
  "/create-course",
  zodValidateRequest(CourseZodValidation.createCourse),
  requireSignin,
  isInstructor,
  CourseController.createCourse,
);

router.post(
  "/free-enrollment/:courseId",
  zodValidateRequest(CourseZodValidation.courseIdZodValidation),
  requireSignin,
  CourseController.freeEnrollment,
);

router.get("/single-course/:slug", CourseController.singleCourse);
router.get(
  "/check-enrollemnt/:courseId",
  requireSignin,
  CourseController.checkEnrollment,
);
router.delete(
  "/lesson/:slug/:instructorId/:lessionID",
  requireSignin,
  isInstructor,
  CourseController.removeLession,
);

router.post(
  "/lesson/:slug/:instructorId",
  zodValidateRequest(CourseZodValidation.lessionCreateZodValidation),
  requireSignin,
  isInstructor,
  CourseController.addLesson,
);

router.put(
  "/lesson/:slug/:instructorId",
  zodValidateRequest(CourseZodValidation.lessonUpdateZod),
  requireSignin,
  CourseController.updateLesson,
);

router.post(
  "/update-course",
  zodValidateRequest(CourseZodValidation.updateCourse),
  requireSignin,
  isInstructor,
  CourseController.updateCourse,
);
router.put(
  "/publish-or-unpublish",
  zodValidateRequest(CourseZodValidation.publishOrUnpublish),
  requireSignin,
  isInstructor,
  CourseController.publishOrUnpublish,
);

export const CourseRouter = router;
