import { Router, type Express } from "express";
import genreRouter from "@/routes/genre";

export const initRoutes = (app: Express) => {
  // Gắn các route của genre vào tiền tố chung /api/genre.
  const apiRouter = Router();
  // Khai báo đường dẫn riêng cho từng tài nguyên.
  apiRouter.use("/genre", genreRouter);

  // Gom tiền tố API tại một nơi: endpoint đầy đủ là /api/genre.
  app.use("/api", apiRouter);
};
