import express from "express";
import "dotenv/config";
import { connectDB } from "@/config/db-connect";
import { initRoutes } from "@/routes/index";
import { Genre } from "@/models/index";
import { errorHandler } from "@/middlewares/error-handler";

const app = express();
const port = process.env.BACKEND_SERVER_PORT ?? 1346;

// Đọc body JSON thành req.body; mặc định cần header Content-Type: application/json.
// Trong Postman chọn Body → raw → JSON; middleware này không đọc form-data hoặc x-www-form-urlencoded.
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to my world");
});

const bootstrap = async () => {
  await connectDB();
  // Với cấu hình tự tạo index hiện tại, chờ unique index của slug sẵn sàng
  // trước khi nhận request để MongoDB chặn các genre trùng slug ngay từ đầu.
  await Genre.init();
  initRoutes(app);
  // Đặt sau tất cả routes để xử lý lỗi chung; Express 5 tự chuyển lỗi từ async controller tới đây.
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
