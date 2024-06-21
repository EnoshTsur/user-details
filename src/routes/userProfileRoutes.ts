import { Request, Response, Router } from "express";
import { UserBasicInfo } from "../model/userProfile";
import {
  createUserProfile,
  deleteUserProfile,
  findAllUserProfiles,
  findUserProfileById,
  updateUserProfile,
} from "../service/userProfileService";
import { authMiddleware } from "./auth.middleware";

const profileRouter = Router();

profileRouter.get("/getAll", async (_: Request, res: Response) => {
  const { error, actionCode, statusCode, body } = await findAllUserProfiles();

  return res.status(statusCode).json({ body, error, actionCode });
});

profileRouter.get("/get", authMiddleware, async (_: Request, res: Response) => {
  const { userId } = res.locals;

  const { error, body, actionCode, statusCode } = await findUserProfileById(userId);

  return res.status(statusCode).json({ error, body, actionCode });
});

profileRouter.put("/update", authMiddleware, async (req: Request, res: Response) => {
  const { userId } = res.locals;

  const userBasicInfo: UserBasicInfo = req.body;

  const { body, statusCode, actionCode, error } = await updateUserProfile(
    userId,
    userBasicInfo
  );

  return res.status(statusCode).json({ body, error, actionCode });
});

profileRouter.post("/new", authMiddleware, async (req: Request, res: Response) => {
  const { userId } = res.locals;

  const userBasicInfo: UserBasicInfo = req.body;

  const { body, statusCode, actionCode, error } = await createUserProfile(
    userId,
    userBasicInfo
  );

  return res.status(statusCode).json({ body, error, actionCode });
});

profileRouter.delete("/delete", authMiddleware, async (req: Request, res: Response) => {
  const { userId } = res.locals;

  const { error, actionCode, statusCode, body } = await deleteUserProfile(userId)

  return res.status(statusCode).json({ error, actionCode, body })
});

export default profileRouter;
