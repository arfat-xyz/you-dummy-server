import { Schema, model } from "mongoose";
import { IProdcutModel, IProduct, IReviews } from "./productInterface";
const reviewsSchema = new Schema<IReviews>({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});
const productSchema = new Schema<IProduct, IProdcutModel>({
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  keyFeatures: [
    {
      type: String,
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  reviews: [reviewsSchema],
});
export const ProductModel = model<IProduct, IProdcutModel>(
  "Product",
  productSchema,
);
