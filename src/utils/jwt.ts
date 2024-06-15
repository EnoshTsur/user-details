import jwt from "jsonwebtoken";


export const generateToken = (userId: string): string => {
  const secretKey = process.env.JWT_KEY;
  console.log(secretKey);
  if (secretKey) {
    return jwt.sign({ userId }, secretKey, { expiresIn: "5h" });
  }
  throw new Error("JWT_KEY is missing")
}
