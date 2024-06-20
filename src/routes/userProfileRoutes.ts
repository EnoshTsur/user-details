import { Request, Response, Router } from "express";
import { UserBasicInfo } from "../model/userProfile";
import { findUserProfileById, saveUserProfile } from "../service/userProfile";
import { authMiddleware } from "./auth.middleware";

const profileRouter = Router();

profileRouter.get("/get", authMiddleware, async (_: Request, res: Response) => {
  const { userId } = res.locals;

  const { error, data, statusCode } = await findUserProfileById(userId);

  return res.status(statusCode).json({ error, data });
});

profileRouter.post(
  "/new",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { userId } = res.locals;

    const userBasicInfo: UserBasicInfo = req.body;

    const { message, statusCode, userProfile, macros, error } =
      await saveUserProfile(userId, userBasicInfo);

    return res.status(statusCode).json({ message, error, userProfile, macros });
  }
);

export default profileRouter;
