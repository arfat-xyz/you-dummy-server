import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/cacheAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sentResponse";
import { productFilterableFields } from "./productConstant";
import { IProduct } from "./productInterface";
import { ProductService } from "./productService";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const payload: IProduct = req.body;
  const result = await ProductService.createProduct(payload);
  sendResponse<IProduct>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product created successfully.`,
    data: result,
  });
});
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields);
  const filters = pick(req.query, productFilterableFields);
  const result = await ProductService.getAllProducts(
    paginationOptions,
    filters,
  );
  sendResponse<IProduct[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product created successfully.`,
    meta: result.meta || null,
    data: result.data || null,
  });
});
export const ProductController = { createProduct, getAllProducts };
