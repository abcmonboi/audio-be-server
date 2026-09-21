import { createGenre, getGenre, getGenreList } from "@/controllers/genre";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";
import { validateObjectId } from "@/middlewares/validate-object-id";

const router = Router();
// POST /api/genre: kiểm tra body trước, chỉ gọi controller khi dữ liệu hợp lệ.
router.post("/", validateBody(commonSchema), createGenre);
// GET /api/genre: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getGenreList);

router.get("/:id", validateObjectId, getGenre);

export default router;
