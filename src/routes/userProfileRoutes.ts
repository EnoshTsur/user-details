import { Request, Response, Router } from "express";
import UserProfile, { UserBasicInfo } from "../model/userProfile";
import {
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "../service/userProfile.service";
import { authMiddleware } from "./auth.middleware";
import logger from "../logger/logger";

const profileRouter = Router();

profileRouter.get("/get", authMiddleware, async (_: Request, res: Response) => {
  const { userId } = res.locals;

  try {
    const user = await UserProfile.findById(userId);
    if (!user) {
      logger.error('[UserProfile-Get]: User doesnt exists according to request token')

      return res.status(400).send({ message: 'There is no user profile matching this token '});
    }
    logger.info(`[UserProfile-Get]: User profile exists: ${JSON.stringify(user)}`)

    return res.status(200).json(user);
  } catch (error) {
    logger.error(`[UserProfile-Get]: Error finding user ${error}`)

    return res.status(500).json({ message: `Error finding user: ${error}` });
  }
});

profileRouter.post("/new", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals;

    const userBasicInfo: UserBasicInfo = req.body;

    const bmr = calculateBMR(userBasicInfo);

    const tdee = calculateTDEE(userBasicInfo);

    const userProfile = {
      _id: userId,
      ...userBasicInfo,
      bmr,
      tdee,
    };

    // Save UserProfile to MongoDB
    await UserProfile.findOneAndUpdate({ _id: userId }, userProfile, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    logger.info(`[UserProfile-New]: New user profile created`)


    res.status(201).json({
      message: "UserProfile saved successfully",
      userProfile,
      macros: {
        cut: calculateMacros(tdee, bmr, userProfile.weight, "cut"),
        bulk: calculateMacros(tdee, bmr, userProfile.weight, "bulk"),
      },
    });
  } catch (err) {
    logger.error(`[UserProfile-New]: Error saving user profile ${err}`)

    res.status(500).json({ error: "Failed to save UserProfile" });
  }
});

export default profileRouter;
