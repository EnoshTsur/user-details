import { Request, Response, Router } from "express";
import UserProfile from "../model/userProfile";
import jwt, { JwtPayload } from "jsonwebtoken";

const profileRouter = Router();

profileRouter.post("/new", async (req: Request, res: Response) => {
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

    console.log({ decodedToken, userId, token });

    const { height, weight, gender, age, activityLevel, bmr, tdee } = req.body;

    const userProfile = new UserProfile({
      _id: userId,
      height,
      weight,
      gender,
      age,
      activityLevel,
      bmr, 
      tdee,
    });

    // Save UserProfile to MongoDB
    await userProfile.save();

    res
      .status(201)
      .json({ message: "UserProfile saved successfully", userProfile });
  } catch (err) {
    console.error("Error saving UserProfile:", err);
    res.status(500).json({ error: "Failed to save UserProfile" });
  }
});

export default profileRouter;
