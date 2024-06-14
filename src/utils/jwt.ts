import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_KEY;

export const generateToken = (userId: string): string => {
  if (secretKey) {
    return jwt.sign({ userId }, secretKey, { expiresIn: "5h" });
  }
  throw new Error("JWT_KEY is missing")
}
