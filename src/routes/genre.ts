import { createGenre } from "@/controllers/genre";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { createGenreSchema } from "@/validators/genre";

const router = Router();
// POST /api/genre: kiểm tra body trước, chỉ gọi controller khi dữ liệu hợp lệ.
router.post("/", validateBody(createGenreSchema), createGenre);

export default router;
