import { Request, Response, Router } from "express";
import { IUserAuth } from "../model/userAuth";
import { authMiddleware } from "./auth.middleware";
import logger from "../logger/logger";
import { registerUser, userLogin } from "../service/authService";

const authRouter = Router();

authRouter.get(
  "/validateToken",
  authMiddleware,
  (req: Request, res: Response) => {
    logger.info("[Auth-TokenValidation] Request token is valid", req.headers);
    return res.status(200).json({ success: true });
  }
);

authRouter.post("/register", async (req: Request, res: Response) => {
  const userAuth: IUserAuth = req.body;
  const { statusCode, message, token, error } = await registerUser(userAuth);

  return res.status(statusCode).json({ message, token, error });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const userAuth: IUserAuth = req.body;

  const { statusCode, error, token } = await userLogin(userAuth);

  return res.status(statusCode).json({ error, token });
});

export default authRouter;
