import { model, Schema, Document, CallbackError } from "mongoose";
import UserAuth from "./userauth";

export enum Gender {
  Male = "male",
  Female = "female",
}

export enum ActivityLevel {
  Sedentary = 1.2,
  LightlyActive = 1.375,
  ModeratelyActive = 1.55,
  VeryActive = 1.725,
  ExtraActive = 1.9,
}

export interface IUserProfile extends Document {
  readonly height: number; // in centimeters
  readonly weight: number; // in kilograms
  readonly gender: Gender;
  readonly age: number; // in years
  readonly activityLevel: ActivityLevel;
  readonly bmr: number
  readonly tdee: number
}

const userProfileSchema = new Schema<IUserProfile>({
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    require: true,
  },
  age: {
    type: Number,
    required: true,
  },
  activityLevel: {
    type: Number,
    enum: Object.values(ActivityLevel),
    required: true,
  },
  bmr: {
      type: Number,
      required: true
  },
  tdee: {
      type: Number,
      required:true
  }
});

const isUserProfile = (doc: Document): doc is IUserProfile =>
  (doc as IUserProfile).age != null;

userProfileSchema.pre<IUserProfile>("save", async function (next) {
  try {
    if (isUserProfile(this)) {
      const existingUser = await UserAuth.findById(this.id);
      if (!existingUser) {
        throw new Error("UserAuth with provided userId does not exist");
      }
    }
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

const UserProfile = model<IUserProfile>("user-profile", userProfileSchema);

export default UserProfile;
