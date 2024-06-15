import { model, Schema, Document } from "mongoose";

export interface IUserAuth extends Document {
  readonly email: string;
  readonly password: string;
}

const userAuthSchema = new Schema<IUserAuth>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserAuth = model<IUserAuth>("user-auth", userAuthSchema);

export default UserAuth;
