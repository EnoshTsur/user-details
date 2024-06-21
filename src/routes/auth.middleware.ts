import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../logger/logger";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error("[AuthMiddleware]: No suitable headers");
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid token" });
  }

  try {
    const token = authHeader.substring("Bearer ".length);

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_KEY ?? ""
    ) as JwtPayload;

    const { userId } = decodedToken;

    res.locals.userId = userId;
    logger.info("[AuthMiddleware]: Valid token");

    return next();
  } catch (e) {
    logger.error("[AuthMiddleware]: Invalid token");

    return res.status(401).json({ message: `invalid token: ${e}` });
  }
};
