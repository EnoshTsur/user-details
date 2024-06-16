import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

        res.locals.userId = userId

        return next()
    } catch(e) {
        return res.status(401).json({ message: `invalid token: ${e}` })
    }
}