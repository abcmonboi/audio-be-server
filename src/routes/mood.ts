import { createMood, deleteMood, editMood, getMood, getMoodList } from "@/controllers/mood";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

// POST /api/mood: kiểm tra body trước khi tạo mới.
router.post("/", validateBody(commonSchema), createMood);

// GET /api/mood: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getMoodList);

// GET /api/mood/:id: kiểm tra ID trước khi lấy chi tiết.
router.get("/:id", validateObjectId, getMood);

// PUT /api/mood/:id: kiểm tra ID và body trước khi cập nhật.
router.put("/:id", validateObjectId, validateBody(commonSchema), editMood);

// DELETE /api/mood/:id: kiểm tra ID trước khi xóa.
router.delete("/:id", validateObjectId, deleteMood);

export default router;
