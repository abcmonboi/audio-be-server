import { createVideoTheme, getVideoThemeList } from "@/controllers/video-theme";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createVideoTheme);
router.get("/", validatePagination, getVideoThemeList);

export default router;
