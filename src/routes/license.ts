import {
  createLicense,
  deleteLicense,
  editLicense,
  getLicense,
  getLicenseList,
} from "@/controllers/license";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

// POST /api/license: kiểm tra body trước khi tạo mới.
router.post("/", validateBody(commonSchema), createLicense);

// GET /api/license: kiểm tra phân trang trước khi lấy danh sách.
router.get("/", validatePagination, getLicenseList);

// GET /api/license/:id: kiểm tra ID trước khi lấy chi tiết.
router.get("/:id", validateObjectId, getLicense);

// PUT /api/license/:id: kiểm tra ID và body trước khi cập nhật.
router.put("/:id", validateObjectId, validateBody(commonSchema), editLicense);

// DELETE /api/license/:id: kiểm tra ID trước khi xóa.
router.delete("/:id", validateObjectId, deleteLicense);

export default router;
