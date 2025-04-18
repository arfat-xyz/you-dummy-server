// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  port: process.env.PORT,
  db_url: process.env.DATABASE_URL,
  env: process.env.NODE_ENV,
  bcryptSaltRound: process.env.BCRYPT_SALT_ROUND,
  jwtSecret: process.env.JWT_SECRET,
};
