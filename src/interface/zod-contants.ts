import { z } from "zod";

export const stringValidation = (fieldName: string) => {
  return z.string({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a string`,
  });
};
