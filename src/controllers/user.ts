import mongoose from "mongoose";
import User from "@/models/user";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";
import type { RegisterInput, VerifyEmailInput } from "@/validators/register";
import { hashPassword } from "@/services/password";
import { createEmailVerificationToken, verifyEmailToken } from "@/services/email-verification";
import { sendCreated, sendSuccess } from "@/utils/response";
import { USER_ROLE, USER_STATUS } from "@/constants/user";

export const register: ValidatedBodyHandler<RegisterInput> = async (_req, res) => {
  const { password, ...profile } = res.locals.body;
  const passwordHash = await hashPassword(password);
  const result = await mongoose.connection.transaction(async (session) => {
    const [user] = await User.create(
      [
        {
          ...profile,
          passwordHash,
          emailVerifiedAt: null,
          status: USER_STATUS.ACTIVE,
          role: USER_ROLE.USER,
        },
      ],
      { session },
    );
    const emailVerification = await createEmailVerificationToken({ user, session });
    return { emailVerification };
  });
  return sendCreated(res, result);
};

export const verifyEmail: ValidatedBodyHandler<VerifyEmailInput> = async (_req, res) => {
  const result = await verifyEmailToken(res.locals.body.token);
  return sendSuccess(res, result, { msg: "Email đã được xác thực" });
};
