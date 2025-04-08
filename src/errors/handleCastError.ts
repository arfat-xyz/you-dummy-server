import { CastError } from "mongoose";
import { IGenericErrorMessage } from "../interface/errors";

const handleCastError = (err: CastError) => {
  const errors: IGenericErrorMessage[] = [
    {
      path: err.path,
      message: `Something now good with ${err.path}`,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    errorsMessages: errors,
    message: "Cast Error",
  };
};
export default handleCastError;
