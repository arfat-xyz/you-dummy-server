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
router.get("/user-courses", requireSignin, CourseController.userCourses);
router.post(
  "/create-course",
  zodValidateRequest(CourseZodValidation.createCourse),
  requireSignin,
  isInstructor,
  CourseController.createCourse,
);
router.post(
  "/lesson-list-completed",
  zodValidateRequest(CourseZodValidation.courseIdZodValidation),
  requireSignin,
  CourseController.listCompleted,
);
router.post(
  "/lesson-mark-as-completed",
  zodValidateRequest(CourseZodValidation.courseIdWithLessonId),
  requireSignin,
  CourseController.lessonMarkAsCompleted,
);
router.post(
  "/lesson-mark-as-incompleted",
  zodValidateRequest(CourseZodValidation.courseIdWithLessonId),
  requireSignin,
  CourseController.lessonMarkAsIncompleted,
);

router.post(
  "/free-enrollment/:courseId",
  zodValidateRequest(CourseZodValidation.courseIdZodValidation),
  requireSignin,
  CourseController.freeEnrollment,
);
router.post(
  "/paid-enrollment/:courseId",
  zodValidateRequest(CourseZodValidation.courseIdZodValidation),
  requireSignin,
  CourseController.paidEnrollment,
);

router.get("/single-course/:slug", CourseController.singleCourse);
router.get(
  "/user/single-course/:slug",
  requireSignin,
  CourseController.userSingleCourse,
);
router.get(
  "/check-enrollemnt/:courseId",
  requireSignin,
  CourseController.checkEnrollment,
);
router.get(
  "/stripe-success/:courseId",
  requireSignin,
  CourseController.stripeSuccess,
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
router.post(
  "/review/:courseId",
  zodValidateRequest(CourseZodValidation.reviewWithCourseIdValidationSchema),
  requireSignin,
  CourseController.createReview,
);

export const CourseRouter = router;
