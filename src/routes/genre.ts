import { createGenre, deleteGenre, editGenre, getGenre, getGenreList } from "@/controllers/genre";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";
import { validateObjectId } from "@/middlewares/validate-object-id";

const router = Router();

// POST /api/genre: kiểm tra body trước khi tạo mới.
router.post("/", validateBody(commonSchema), createGenre);

// GET /api/genre: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getGenreList);

// GET /api/genre/:id: kiểm tra ID trước khi lấy chi tiết.
router.get("/:id", validateObjectId, getGenre);

// PUT /api/genre/:id: kiểm tra ID và body trước khi cập nhật.
router.put("/:id", validateObjectId, validateBody(commonSchema), editGenre);

// DELETE /api/genre/:id: kiểm tra ID trước khi xóa.
router.delete("/:id", validateObjectId, deleteGenre);

export default router;
