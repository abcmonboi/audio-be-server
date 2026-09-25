/* Worker là process Node riêng, kết nối cùng MongoDB;
là tên gọi theo vai trò của chương trình, không phải thành phần có sẵn của Express
Worker chạy nền
  → lấy công việc gửi email từ MongoDB
  → gọi mailer service để gửi
  → cập nhật kết quả, lên lịch retry nếu lỗi

Worker và service khác nhau ở trách nhiệm:
- Worker: chủ động lấy việc đang chờ, gọi hàm xử lý, quản lý retry.
- Service: cung cấp hàm xử lý; chỉ chạy khi được caller.

*/
import "dotenv/config";
import mongoose from "mongoose";
import { setTimeout as delay } from "node:timers/promises";
import { connectDB } from "@/config/db-connect";
import { getEmailConfig } from "@/config/email";
import { initializeRegistration } from "@/config/registration";
import { processNextEmailJob } from "@/services/email-delivery";

async function run() {
  getEmailConfig();
  await connectDB();
  await initializeRegistration();
  let stopping = false;
  const stop = () => {
    stopping = true;
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  try {
    while (!stopping) {
      try {
        if (!(await processNextEmailJob())) await delay(1000);
      } catch {
        console.error("Email worker iteration failed; retrying in 5 seconds");
        await delay(5000);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}
run().catch(() => {
  console.error("Email worker startup failed; check configuration and database");
  process.exitCode = 1;
  void mongoose.disconnect();
});
