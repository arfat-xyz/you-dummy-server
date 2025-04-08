import { z } from "zod";

const createProduct = z.object({
  body: z.object({
    productName: z.string({
      required_error: "Product name is required",
    }),
    reviews: z.object({
      userId: z.string({
        required_error: "User id is required",
      }),
      comment: z.string({
        required_error: "Comment is required",
      }),
      rating: z.number({
        required_error: "Rating is required",
      }),
    }),
    image: z.string({
      required_error: "Image is required",
    }),
    category: z.string({
      required_error: "Category is required",
    }),
    price: z.number({
      required_error: "Price is required",
    }),
    status: z.boolean({
      required_error: "Status is required",
    }),
    description: z.string({
      required_error: "Description is required",
    }),
    keyFeatures: z
      .string({
        required_error: "Title is required",
      })
      .array(),
  }),
});

export const productZodSchema = { createProduct };
