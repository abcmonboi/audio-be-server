import { createInstrument, getInstrumentList } from "@/controllers/instrument";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createInstrument);
router.get("/", validatePagination, getInstrumentList);

export default router;
