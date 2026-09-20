import { Router, type Express } from "express";
import genreRouter from "@/routes/genre";
import videoThemeRouter from "@/routes/video-theme";
import licenseRouter from "@/routes/license";
import instrumentRouter from "@/routes/instrument";
import moodRouter from "@/routes/mood";

export const initRoutes = (app: Express) => {
  // Gắn các route tài nguyên vào tiền tố chung /api.
  const apiRouter = Router();
  // Khai báo đường dẫn riêng cho từng tài nguyên.
  apiRouter.use("/genre", genreRouter);
  apiRouter.use("/video-theme", videoThemeRouter);
  apiRouter.use("/license", licenseRouter);
  apiRouter.use("/instrument", instrumentRouter);
  apiRouter.use("/mood", moodRouter);

  // Gom tiền tố API tại một nơi.
  app.use("/api", apiRouter);
};
