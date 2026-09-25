import mongoose from "mongoose";
import { USER_ROLE, USER_ROLE_VALUES, USER_STATUS, USER_STATUS_VALUES } from "@/constants/user";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    dateOfBirth: { type: String, default: null },
    emailVerifiedAt: { type: Date, default: null },
    status: { type: String, enum: USER_STATUS_VALUES, default: USER_STATUS.ACTIVE, required: true },
    role: { type: String, enum: USER_ROLE_VALUES, default: USER_ROLE.USER, required: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });
export default mongoose.model("User", userSchema);
