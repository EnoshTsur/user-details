import { Request, Response, Router } from "express";
import UserAuth, { IUserAuth } from "../model/userAuth";
import { hashPassword } from "../utils/hashPassword";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { authMiddleware } from "./auth.middleware";
import logger from "../logger/logger";

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
  const { email, password }: IUserAuth = req.body;

  logger.info(`[Auth-Register] Request for user registration for email:${email}`);

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = new UserAuth({ email, password: hashedPassword });
    await newUser.save();

    logger.info(
      `[Auth-Register] User saved successfully on mongodb server:${JSON.stringify(
        newUser
      )}`
    );

    try {
      const token = generateToken(newUser.id.toString());
      logger.info(`[Auth-Register] Token generated successfully:${token}`);

      return res.status(200).json({ token });
    } catch (e) {
      logger.error(`[Auth-Register] Error in token creation: ${e}`);

      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    logger.error(`[Auth-Register] Error in user creation: ${error}`);

    res.status(500).json({ message: `Error creating user: ${error}` });
  }
});

authRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await UserAuth.findById(id);
    if (!user) {
      logger.error(`[Auth-FindByID] User with the id:${id} does not exists`);

      return res.status(400).send("User not found");
    }
    logger.info(`[Auth-FindByID] User with the id:${id} exists`);

    return res.status(200).json(user);
  } catch (error) {
    logger.error(
      `[Auth-FindByID] Error finding user with the id:${id}. error: ${error}`
    );

    return res.status(500).json({ message: `Error finding user: ${error}` });
  }
});

authRouter.get("/email/:email", async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const user = await UserAuth.findOne({ email });
    if (!user) {
      logger.error(
        `[Auth-FindByEmail] User with the email:${email} does not exists`
      );

      return res.status(400).json({ message: "User not found" });
    }
    logger.info(`[Auth-FindByEmail] User with the email:${email} exists`);

    return res.status(200).json(user);
  } catch (error) {
    logger.error(
      `[Auth-FindByEmail] Error finding user with the email:${email}. error: ${error}`
    );

    return res.status(500).json({ message: `Error finding user: ${error}` });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password }: IUserAuth = req.body;

  try {
    const user = await UserAuth.findOne({ email });
    if (!user) {
      logger.info(`[Auth-Login] User with the email:${email} does not exists`);

      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error(`[Auth-Login] Invalid credentials`);

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id.toString());
    logger.info(`[Auth-Login] Token generated`);

    return res.status(200).json({ token });
  } catch (error) {
    logger.error(`[Auth-Login] Error finding user by the email: ${email}`);

    return res.status(500).json({ message: `Error login: ${error}` });
  }
});

export default authRouter;
