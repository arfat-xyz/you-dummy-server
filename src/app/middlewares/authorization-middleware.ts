import { Request } from "express";
import { expressjwt } from "express-jwt";
import { config } from "../../config";
export const requireSignin = expressjwt({
  getToken: (req: Request) => {
    return req.cookies.token;
  },
  secret: config.jwtSecret as string,
  algorithms: ["HS256"],
});
