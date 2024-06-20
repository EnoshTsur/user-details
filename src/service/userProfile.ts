import logger from "../logger/logger";
import UserProfile, {
  UserBasicInfo,
} from "../model/userProfile";
import { calculateBMR, calculateMacros, calculateTDEE } from "../utils/nutrition";



export const findUserProfileById = async (userId: string) => {
  try {
    const user = await UserProfile.findById(userId);
    if (!user) {
      logger.error(
        "[findUserProfileById]: User doesn't exist according to request token"
      );
      return {
        error: "There is no user profile matching this token",
        statusCode: 400,
      };
    }
    logger.info(
      `[findUserProfileById]: User profile exists: ${JSON.stringify(
        user
      )}`
    );
    return { data: user, statusCode: 200 };
  } catch (error) {
    logger.error(
      `[findUserProfileById]: Error finding user ${error}`
    );
    return { error: `Error finding user: ${error}`, statusCode: 500 };
  }
};

export const saveUserProfile = async (userId: string, userBasicInfo: UserBasicInfo) => {
  try {
    const bmr = calculateBMR(userBasicInfo);
    const tdee = calculateTDEE(userBasicInfo);

    const userProfile = {
      _id: userId,
      ...userBasicInfo,
      bmr,
      tdee,
    };

    const updatedUserProfile = await UserProfile.findOneAndUpdate({ _id: userId }, userProfile, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    logger.info(`[saveUserProfile]: New user profile created`);

    return {
      message: "UserProfile saved successfully",
      userProfile: updatedUserProfile,
      macros: {
        cut: calculateMacros(tdee, bmr, userProfile.weight, "cut"),
        bulk: calculateMacros(tdee, bmr, userProfile.weight, "bulk"),
      },
      statusCode: 201
    };
  } catch (error) {
    logger.error(`[saveUserProfile]: Error saving user profile ${error}`);
    return { error: "Failed to save UserProfile", statusCode: 500 };
  }
};
