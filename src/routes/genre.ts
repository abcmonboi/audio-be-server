import { createGenre, getGenreList } from "@/controllers/genre";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { createGenreSchema } from "@/validators/genre";

const router = Router();
// POST /api/genre: kiểm tra body trước, chỉ gọi controller khi dữ liệu hợp lệ.
router.post("/", validateBody(createGenreSchema), createGenre);
// GET /api/genre: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getGenreList);

export default router;
