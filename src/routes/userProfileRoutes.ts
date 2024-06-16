import { Request, Response, Router } from "express";
import UserProfile, { UserBasicInfo } from "../model/userProfile";
import {
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "../service/userProfile.service";
import { authMiddleware } from "./auth.middleware";

const profileRouter = Router();

profileRouter.get("/get", authMiddleware, async (_: Request, res: Response) => {
  const { userId } = res.locals;

  try {
    const user = await UserProfile.findById(userId);
    if (!user) {
      return res.status(400).send({ message: 'There is no user profile matching this token '});
    }
    return res.status(200).json(user);
  } catch (error) {
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

    res.status(201).json({
      message: "UserProfile saved successfully",
      userProfile,
      macros: {
        cut: calculateMacros(tdee, bmr, userProfile.weight, "cut"),
        bulk: calculateMacros(tdee, bmr, userProfile.weight, "bulk"),
      },
    });
  } catch (err) {
    console.error("Error saving UserProfile:", err);
    res.status(500).json({ error: "Failed to save UserProfile" });
  }
});

export default profileRouter;
