import mongoose, { type ClientSession, type Types } from "mongoose";
import User from "@/models/user";
import EmailVerificationToken from "@/models/email-verification-token";
import { USER_STATUS } from "@/constants/user";
import { encryptToken, generateToken, hashToken } from "@/services/token-crypto";
import { AppError } from "@/utils/app-error";

const invalidToken = () =>
  new AppError(400, "INVALID_OR_EXPIRED_TOKEN", "Token không hợp lệ, đã dùng hoặc hết hạn");

// Token xác thực email có hiệu lực trong 30 phút (đơn vị: mili giây).
const EMAIL_VERIFICATION_TOKEN_TTL_MS = 30 * 60_000;

// Caller quản lý transaction để tạo user và token cùng thành công hoặc cùng rollback.
export async function createEmailVerificationToken({
  user,
  session,
  now = new Date(),
}: {
  user: { _id: Types.ObjectId };
  session: ClientSession;
  now?: Date;
}) {
  const rawToken = generateToken();
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
  await EmailVerificationToken.create(
    [
      {
        userId: user._id,
        tokenHash: hashToken(rawToken),
        expiresAt,
        usedAt: null,
        delivery: {
          encryptedToken: encryptToken(rawToken),
          status: "queued",
          attempts: 0,
          nextAttemptAt: now,
        },
      },
    ],
    { session },
  );
  return { status: "queued" as const, expiresAt };
}

export async function verifyEmailToken(rawToken: string) {
  return mongoose.connection.transaction(async (session) => {
    const now = new Date();
    const token = await EmailVerificationToken.findOneAndUpdate(
      { tokenHash: hashToken(rawToken), usedAt: null, expiresAt: { $gt: now } },
      {
        $set: { usedAt: now },
        $unset: { "delivery.encryptedToken": 1, "delivery.leaseId": 1, "delivery.leaseUntil": 1 },
      },
      { session, returnDocument: "after" },
    );
    if (!token) throw invalidToken();
    const result = await User.updateOne(
      { _id: token.userId, emailVerifiedAt: null, status: USER_STATUS.ACTIVE },
      { $set: { emailVerifiedAt: now } },
      { session },
    );
    if (result.modifiedCount !== 1) throw invalidToken();
    return { emailVerifiedAt: now };
  });
}
