import bcrypt from "bcrypt";
import { config } from "../../../config";

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise<string> - Resolves with the hashed password
 */
export const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(
      Number(config.bcryptSaltRound),
      (err: Error | undefined, salt: string) => {
        if (err) {
          reject(err);
          return;
        }
        bcrypt.hash(password, salt, (err: Error | undefined, hash: string) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(hash);
        });
      },
    );
  });
};

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password to compare
 * @param hashed - The hashed password to compare against
 * @returns Promise<boolean> - Resolves with true if passwords match
 */
export const comparePassword = (
  password: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};
