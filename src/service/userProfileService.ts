import { UserProfileActions } from "../actions/userProfile.action";
import { Dto } from "../dto/dto";
import logger from "../logger/logger";
import UserProfile, { IUserProfile, UserBasicInfo } from "../model/userProfile";
import { calculateBMR, calculateTDEE } from "../utils/nutrition";

export const findAllUserProfiles = async (): Promise<
  Dto<ReadonlyArray<IUserProfile>>
> => {
  logger.info("[findAllUserProfiles] Request for all profiles");
  try {
    const profiles: ReadonlyArray<IUserProfile> = await UserProfile.find({});
    logger.info("[findAllUserProfiles] Retrieving all users");

    return {
      statusCode: 200,
      body: profiles,
      actionCode: UserProfileActions.GET_ALL,
      error: null,
    };
  } catch (error) {
    logger.error(`[findAllUserProfiles] Error retrieving users: ${error}`);

    return {
      statusCode: 500,
      body: [],
      actionCode: UserProfileActions.GET_ALL_FAILURE,
      error: `${error}`,
    };
  }
};

export const findUserProfileById = async (
  userId: string
): Promise<Dto<IUserProfile>> => {
  try {
    const user = await UserProfile.findById(userId);
    if (!user) {
      logger.error(
        "[findUserProfileById]: User doesn't exist according to request token"
      );
      return {
        error: "There is no user profile matching this token",
        statusCode: 400,
        body: null,
        actionCode: UserProfileActions.GET_BY_ID_FAILURE,
      };
    }
    logger.info(
      `[findUserProfileById]: User profile exists: ${JSON.stringify(user)}`
    );
    return {
      body: user,
      statusCode: 200,
      error: null,
      actionCode: UserProfileActions.GET_BY_ID,
    };
  } catch (error) {
    logger.error(`[findUserProfileById]: Error finding user ${error}`);
    return {
      error: `Error finding user: ${error}`,
      statusCode: 500,
      body: null,
      actionCode: UserProfileActions.GET_BY_ID_FAILURE,
    };
  }
};

export const createUserProfile = async (
  userId: string,
  userBasicInfo: UserBasicInfo
): Promise<Dto<IUserProfile>> => {
  try {
    const existingProfile = await UserProfile.findById(userId);

    if (existingProfile) {
      return {
        statusCode: 400,
        actionCode: UserProfileActions.CREATE_FAILURE,
        error: `User profile already exists with id ${userId}`,
        body: null,
      };
    }

    const bmr = calculateBMR(userBasicInfo);
    const tdee = calculateTDEE(userBasicInfo);

    const newProfile = new UserProfile({
      _id: userId,
      ...userBasicInfo,
      bmr,
      tdee,
    });

    const createdUserProfile = await newProfile.save();

    logger.info(`[createUserProfile]: New user profile created`);

    return {
      body: createdUserProfile,
      statusCode: 200,
      actionCode: UserProfileActions.CREATE,
      error: null,
    };
  } catch (error) {
    logger.error(`[createUserProfile]: Error creating user profile ${error}`);
    return {
      error: `Failed to create UserProfile: ${error}`,
      statusCode: 500,
      body: null,
      actionCode: UserProfileActions.CREATE_FAILURE,
    };
  }
};


export const updateUserProfile = async (
  userId: string,
  userBasicInfo: UserBasicInfo
): Promise<Dto<IUserProfile>> => {
  try {

    const userProfile = await UserProfile.findById(userId);

    if (!userProfile) {
      return {
        statusCode: 404,
        actionCode: UserProfileActions.UPDATE_FAILURE,
        error: `No user by the id ${userId}`,
        body: null,
      };
    }

    const bmr = calculateBMR(userBasicInfo);
    const tdee = calculateTDEE(userBasicInfo);


    const completeProfile = {
      ...userProfile?.toObject(),
      ...userBasicInfo,
      _id: userId,
      bmr,
      tdee,
    };

    const updatedUserProfile = await UserProfile.findByIdAndUpdate(
      userId,
      completeProfile,
      { new: true, runValidators: true }
    );

    logger.info(`[saveUserProfile]: New user profile created`);

    return {
      body: updatedUserProfile,
      statusCode: 200,
      actionCode: UserProfileActions.UPDATE,
      error: null,
    };
  } catch (error) {
    logger.error(`[saveUserProfile]: Error saving user profile ${error}`);
    return {
      error: `Failed to save UserProfile: ${error}`,
      statusCode: 500,
      body: null,
      actionCode: UserProfileActions.UPDATE_FAILURE,
    };
  }
};


export const deleteUserProfile = async (userId: string): Promise<Dto<IUserProfile>> => {
  try {
    const userProfile = await UserProfile.findById(userId);

    if (!userProfile) {
      return {
        statusCode: 404,
        actionCode: UserProfileActions.DELETE_FAILURE,
        error: `No user found with the id ${userId}`,
        body: null,
      };
    }

    const deleted = await UserProfile.findByIdAndDelete(userId);

    logger.info(`[deleteUserProfile]: User profile deleted with id ${userId}`);

    return {
      body: deleted,
      statusCode: 200,
      actionCode: UserProfileActions.DELETE,
      error: null,
    };
  } catch (error) {
    logger.error(`[deleteUserProfile]: Error deleting user profile ${error}`);
    return {
      error: `Failed to delete UserProfile: ${error}`,
      statusCode: 500,
      body: null,
      actionCode: UserProfileActions.DELETE_FAILURE,
    };
  }
};
