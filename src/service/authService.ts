import { UserAuthActions } from "../actions/userAuth.action";
import { Dto } from "../dto/dto";
import logger from "../logger/logger";
import UserAuth, { IUserAuth } from "../model/userAuth";
import { hashPassword } from "../utils/hashPassword";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";

export const registerUser = async ({
  email,
  password,
}: IUserAuth): Promise<Dto<string>> => {
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

      return {
        statusCode: 200,
        body: token,
        error: null,
        actionCode: UserAuthActions.REGISTER,
      };
    } catch (error) {
      logger.error(`[Auth-Register] Error in token creation: ${error}`);

      return {
        statusCode: 500,
        error: `Internal server error: ${error}`,
        body: null,
        actionCode: UserAuthActions.REGISTER_FAILURE,
      };
    }
  } catch (error) {
    logger.error(`[Auth-Register] Error in user creation: ${error}`);

    return {
      statusCode: 500,
      error: `Error creating user: ${error}`,
      body: null,
      actionCode: UserAuthActions.REGISTER_FAILURE,
    };
  }
};

export const userLogin = async ({
  email,
  password,
}: IUserAuth): Promise<Dto<string>> => {
  try {
    const user = await UserAuth.findOne({ email });
    if (!user) {
      logger.info(`[Auth-Login] User with the email:${email} does not exists`);

      return {
        statusCode: 404,
        error: `User by the email: ${email} wasn't found`,
        body: null,
        actionCode: UserAuthActions.LOGIN_FAILURE,
      };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error(`[Auth-Login] Invalid credentials`);

      return {
        statusCode: 401,
        error: "Invalid credentials ( password )",
        body: null,
        actionCode: UserAuthActions.LOGIN_FAILURE,
      };
    }

    const token = generateToken(user.id.toString());
    logger.info(`[Auth-Login] Token generated`);

    return {
      statusCode: 200,
      body: token,
      error: null,
      actionCode: UserAuthActions.LOGIN,
    };
  } catch (error) {
    logger.error(`[Auth-Login] Error finding user by the email: ${email}`);

    return {
      statusCode: 500,
      error: `Error login: ${error}`,
      body: null,
      actionCode: UserAuthActions.LOGIN_FAILURE,
    };
  }
};
