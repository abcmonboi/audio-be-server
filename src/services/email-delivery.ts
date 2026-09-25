import { randomUUID } from "node:crypto";
import EmailVerificationToken from "@/models/email-verification-token";
import User from "@/models/user";
import { USER_STATUS } from "@/constants/user";
import { decryptToken } from "@/services/token-crypto";
import { getEmailConfig } from "@/config/email";
import { MailDeliveryError, sendVerificationEmail, type VerificationMail } from "@/services/mailer";

export async function claimEmailJob(now = new Date()) {
  // Lượt cuối chết sau claim không được kẹt mãi ở sending.
  await EmailVerificationToken.updateMany(
    {
      usedAt: null,
      "delivery.status": "sending",
      "delivery.leaseUntil": { $lte: now },
      "delivery.attempts": { $gte: 3 },
    },
    {
      $set: { "delivery.status": "failed", "delivery.lastErrorCode": "LEASE_EXHAUSTED" },
      $unset: { "delivery.leaseId": 1, "delivery.leaseUntil": 1 },
    },
  );
  return EmailVerificationToken.findOneAndUpdate(
    {
      usedAt: null,
      expiresAt: { $gt: now },
      "delivery.attempts": { $lt: 3 },
      $or: [
        { "delivery.status": "queued", "delivery.nextAttemptAt": { $lte: now } },
        { "delivery.status": "sending", "delivery.leaseUntil": { $lte: now } },
      ],
    },
    {
      $set: {
        "delivery.status": "sending",
        "delivery.leaseId": randomUUID(),
        "delivery.leaseUntil": new Date(now.getTime() + 60_000),
      },
      $inc: { "delivery.attempts": 1 },
    },
    { returnDocument: "after", sort: { "delivery.nextAttemptAt": 1 } },
  ).select("+tokenHash +delivery.encryptedToken");
}

type ClaimedJob = NonNullable<Awaited<ReturnType<typeof claimEmailJob>>>;
export async function processEmailJob(
  job: ClaimedJob,
  send: (mail: VerificationMail) => Promise<void> = sendVerificationEmail,
) {
  const owner = {
    _id: job._id,
    tokenHash: job.tokenHash,
    usedAt: null,
    "delivery.leaseId": job.delivery!.leaseId,
    "delivery.status": "sending" as const,
  };
  const unsetLease = { "delivery.leaseId": 1 as const, "delivery.leaseUntil": 1 as const };
  try {
    // Verify hoặc worker khác có thể đã thay document sau khi nhận việc.
    if (
      !(await EmailVerificationToken.exists({
        ...owner,
        "delivery.leaseUntil": { $gt: new Date() },
        expiresAt: { $gt: new Date() },
      }))
    )
      return;
    const user = await User.findOne({
      _id: job.userId,
      emailVerifiedAt: null,
      status: USER_STATUS.ACTIVE,
    });
    if (!user) {
      await EmailVerificationToken.updateOne(owner, {
        $set: { "delivery.status": "failed", "delivery.lastErrorCode": "USER_NOT_ELIGIBLE" },
        $unset: { ...unsetLease, "delivery.encryptedToken": 1 },
      });
      return;
    }
    let rawToken: string;
    try {
      if (!job.delivery?.encryptedToken) throw new Error("Missing token");
      rawToken = decryptToken(job.delivery.encryptedToken);
    } catch {
      throw new MailDeliveryError("TOKEN_DECRYPT_FAILED", false);
    }
    const url = new URL("/email-verification", getEmailConfig().FRONTEND_URL);
    url.hash = `token=${rawToken}`;
    await send({ to: user.email, firstname: user.firstname, verificationUrl: url.toString() });
    const saved = await EmailVerificationToken.updateOne(
      { ...owner, "delivery.leaseUntil": { $gt: new Date() } },
      {
        $set: { "delivery.status": "sent" },
        $unset: { ...unsetLease, "delivery.lastErrorCode": 1 },
      },
    );
    if (saved.modifiedCount)
      console.info(
        JSON.stringify({
          event: "email_sent",
          attempts: job.delivery!.attempts,
          ageMs: Date.now() - job.createdAt.getTime(),
        }),
      );
  } catch (error) {
    const retryable = error instanceof MailDeliveryError && error.retryable;
    const code = error instanceof MailDeliveryError ? error.code : "DELIVERY_FAILED";
    const now = new Date();
    const attempts = job.delivery!.attempts;
    const next = new Date(now.getTime() + (attempts === 1 ? 30_000 : 120_000));
    const retry = retryable && attempts < 3 && next < job.expiresAt;
    await EmailVerificationToken.updateOne(
      { ...owner, "delivery.leaseUntil": { $gt: now } },
      {
        $set: {
          "delivery.status": retry ? "queued" : "failed",
          "delivery.nextAttemptAt": next,
          "delivery.lastErrorCode": code,
        },
        $unset: unsetLease,
      },
    );
    // Chỉ log mã lỗi đã lọc, không log error từ SMTP hoặc URL chứa token.
    console.warn(JSON.stringify({ event: "email_delivery_failed", code, retry }));
  }
}

export async function processNextEmailJob() {
  const job = await claimEmailJob();
  if (!job) return false;
  await processEmailJob(job);
  return true;
}
