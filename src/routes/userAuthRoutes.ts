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
  const { statusCode, body, actionCode, error } = await registerUser(userAuth);

  return res.status(statusCode).json({ body, actionCode, error });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const userAuth: IUserAuth = req.body;

  const { statusCode, error, body, actionCode } = await userLogin(userAuth);

  return res.status(statusCode).json({ error, body, actionCode });
});

export default authRouter;
