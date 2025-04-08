import { SortOrder } from "mongoose";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { ProductModel } from "./prodcutSchema";
import { productSearchableFields } from "./productConstant";
import { IProduct, IProductFilters } from "./productInterface";

const createProduct = async (payload: IProduct) => {
  const result = await ProductModel.create(payload);
  return result;
};
const getAllProducts = async (
  paginationOptions: IPaginationOptions,
  filters: IProductFilters,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);
  const { searchTerm, ...filtersFields } = filters;
  const sortCondition: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: productSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersFields).length) {
    andCondition.push({
      $and: Object.entries(filtersFields).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const result = await ProductModel.find(whereCondition)
    // .populate([
    //   {
    //     path: 'academicSemister',
    //   },
    //   {
    //     path: 'academicDepartment',
    //   },
    //   {
    //     path: 'academicFaculty',
    //   },
    // ])
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);
  const total = await ProductModel.countDocuments(whereCondition);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
export const ProductService = { createProduct, getAllProducts };
