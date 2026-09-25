import mongoose from "mongoose";

const encryptedTokenSchema = new mongoose.Schema(
  {
    // Token gốc đã mã hóa để worker dựng link; không phải tokenHash.
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true }, // Nonce mới cho mỗi lần mã hóa.
    tag: { type: String, required: true }, // Kiểm tra toàn vẹn bản mã.
    keyId: { type: String, required: true }, // Khóa thực nằm ngoài DB.
  },
  // eslint-disable-next-line models/camel-case-keys -- Tùy chọn Mongoose, không phải field nghiệp vụ.
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true }, // API tự kiểm tra; TTL chỉ dọn rác.
    usedAt: { type: Date, default: null }, // Giữ dấu đã dùng đến khi TTL dọn.
    delivery: {
      encryptedToken: { type: encryptedTokenSchema, select: false },
      status: { type: String, enum: ["queued", "sending", "sent", "failed"], required: true },
      attempts: { type: Number, default: 0, min: 0, max: 3 }, // Tối đa 3 lần/đợt gửi.
      nextAttemptAt: { type: Date, required: true }, // Thời điểm được retry, tồn tại qua restart.
      leaseId: String, // Mỗi lượt claim có ID mới, worker cũ không ghi đè lượt mới.
      leaseUntil: Date, // Hết hạn giữ việc thì worker khác được phục hồi.
      lastErrorCode: String, // Chỉ mã lỗi đã lọc, không chứa link/secret.
    },
  },
  { collection: "email_verification_tokens", timestamps: true },
);
schema.index({ userId: 1 }, { unique: true });
schema.index({ tokenHash: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// eslint-disable-next-line models/camel-case-keys -- Index MongoDB dùng đường dẫn nested field.
schema.index({ "delivery.status": 1, "delivery.nextAttemptAt": 1 });
// eslint-disable-next-line models/camel-case-keys -- Index MongoDB dùng đường dẫn nested field.
schema.index({ "delivery.status": 1, "delivery.leaseUntil": 1 });
export default mongoose.model("EmailVerificationToken", schema);
