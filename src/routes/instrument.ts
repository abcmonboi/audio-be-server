import {
  createInstrument,
  deleteInstrument,
  editInstrument,
  getInstrument,
  getInstrumentList,
} from "@/controllers/instrument";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

// POST /api/instrument: kiểm tra body trước khi tạo mới.
router.post("/", validateBody(commonSchema), createInstrument);

// GET /api/instrument: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getInstrumentList);

// GET /api/instrument/:id: kiểm tra ID trước khi lấy chi tiết.
router.get("/:id", validateObjectId, getInstrument);

// PUT /api/instrument/:id: kiểm tra ID và body trước khi cập nhật.
router.put("/:id", validateObjectId, validateBody(commonSchema), editInstrument);

// DELETE /api/instrument/:id: kiểm tra ID trước khi xóa.
router.delete("/:id", validateObjectId, deleteInstrument);

export default router;
