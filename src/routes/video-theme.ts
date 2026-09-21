import {
  createVideoTheme,
  deleteVideoTheme,
  editVideoTheme,
  getVideoTheme,
  getVideoThemeList,
} from "@/controllers/video-theme";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

// POST /api/video-theme: kiểm tra body trước khi tạo mới.
router.post("/", validateBody(commonSchema), createVideoTheme);

// GET /api/video-theme: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getVideoThemeList);

// GET /api/video-theme/:id: kiểm tra ID trước khi lấy chi tiết.
router.get("/:id", validateObjectId, getVideoTheme);

// PUT /api/video-theme/:id: kiểm tra ID và body trước khi cập nhật.
router.put("/:id", validateObjectId, validateBody(commonSchema), editVideoTheme);

// DELETE /api/video-theme/:id: kiểm tra ID trước khi xóa.
router.delete("/:id", validateObjectId, deleteVideoTheme);

export default router;
