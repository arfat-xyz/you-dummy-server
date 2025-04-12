export type IPaginationOptions = {
  page?: number;
  limit?: number;

  sortBy?: "name" | "category" | "createdAt";

  // sortBy?: string;

  sortOrder?: "asc" | "desc";
};
