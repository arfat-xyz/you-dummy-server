import { ITokenUser } from "./app/modules/auth/auth-interface";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export {};
declare global {
  namespace Express {
    interface Request {
      auth: ITokenUser | null;
    }
  }
}
