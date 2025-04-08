export type IPaginationOptions = {
  page?: number;
  limit?: number;

  sortBy?: "title" | "year" | "code" | "startMonth" | "endMonth" | "createdAt";

  // sortBy?: string;

  sortOrder?: "asc" | "desc";
};
