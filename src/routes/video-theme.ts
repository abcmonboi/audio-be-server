import { createVideoTheme, getVideoTheme, getVideoThemeList } from "@/controllers/video-theme";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createVideoTheme);
router.get("/", validatePagination, getVideoThemeList);
router.get("/:id", validateObjectId, getVideoTheme);

export default router;
