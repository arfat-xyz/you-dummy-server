import { IGenericErrorMessage } from "./errors";

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorsMessages: Array<IGenericErrorMessage>;
};
export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};
