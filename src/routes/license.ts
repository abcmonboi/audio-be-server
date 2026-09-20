import { createLicense, getLicenseList } from "@/controllers/license";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createLicense);
router.get("/", validatePagination, getLicenseList);

export default router;
