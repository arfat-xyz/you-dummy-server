import { Router } from "express";
import zodValidateRequest from "../../middlewares/zodValidateRequest";
import { ProductController } from "./productController";
import { productZodSchema } from "./productZodValidation";

const router = Router();

router.post(
  "/",
  zodValidateRequest(productZodSchema.createProduct),
  ProductController.createProduct,
);
router.get("/", ProductController.getAllProducts);

export const ProductRoutes = router;
