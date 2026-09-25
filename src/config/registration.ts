import mongoose from "mongoose";
import User from "@/models/user";
import EmailVerificationToken from "@/models/email-verification-token";

export async function initializeRegistration() {
  const hello = await mongoose.connection.db!.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid")
    throw new Error("Registration requires a MongoDB replica set or sharded cluster");
  // Xây index trước khi nhận request; không dùng syncIndexes để tránh xóa index hiện hữu.
  await Promise.all([User.createIndexes(), EmailVerificationToken.createIndexes()]);
}
