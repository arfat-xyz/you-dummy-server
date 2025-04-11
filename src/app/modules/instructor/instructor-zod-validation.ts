import { z } from "zod";
import { stringValidation } from "../../../interface/zod-contants";

const makeInstructor = z.object({
  _id: stringValidation("ID"),
});
export const instructorUserZod = z.object({
  password: stringValidation("Password"), // Ensures password is a string between 6 and 64 characters
  picture: stringValidation("Picture"), // Ensures the picture is a string with a default value
  role: z.array(z.enum(["Subscriber", "Instructor", "Admin"])), // Ensures role is one of the specified values
  name: stringValidation("Name").min(1), // Ensures name is a non-empty string
  email: stringValidation("Email").email(), // Ensures email is a valid email address
  _id: stringValidation("ID"), // Ensures _id is a valid UUID string (you can adjust this based on your ID type)
});

// Define types for form data
export type IMakeInstructorProps = z.infer<typeof makeInstructor>;
export type IInstructorUserProps = z.infer<typeof instructorUserZod>;
export const InstructorZodSchema = {
  makeInstructor,
  instructorUserZod,
};
