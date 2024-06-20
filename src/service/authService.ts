import logger from "../logger/logger";
import UserAuth, { IUserAuth } from "../model/userAuth";
import { hashPassword } from "../utils/hashPassword";
import { generateToken } from "../utils/jwt";
import bcrypt from 'bcrypt'

export const registerUser = async ({ email, password }: IUserAuth) => {
  logger.info(
    `[Auth-Register] Request for user registration for email:${email}`
  );

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

      return { statusCode: 200, message: 'User created successfully', token };
    } catch (error) {
      logger.error(`[Auth-Register] Error in token creation: ${error}`);

      return { statusCode: 500, error: "Internal server error" };
    }
  } catch (error) {
    logger.error(`[Auth-Register] Error in user creation: ${error}`);

    return { statusCode: 500, error: `Error creating user: ${error}`, };
  }
};

export const userLogin = async ({ email, password}: IUserAuth) => {
    try {
        const user = await UserAuth.findOne({ email });
        if (!user) {
          logger.info(`[Auth-Login] User with the email:${email} does not exists`);
    
          return { statusCode: 404, error: "User not found" };
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          logger.error(`[Auth-Login] Invalid credentials`);
    
          return { statusCode: 401,  error: "Invalid credentials" };
        }
    
        const token = generateToken(user.id.toString());
        logger.info(`[Auth-Login] Token generated`);
    
        return { statusCode: 200,  token };
      } catch (error) {
        logger.error(`[Auth-Login] Error finding user by the email: ${email}`);
    
        return { statusCode: 500, error: `Error login: ${error}` };
      }
}
