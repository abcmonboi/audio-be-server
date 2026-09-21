import {
  createInstrument,
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

router.post("/", validateBody(commonSchema), createInstrument);
router.get("/", validatePagination, getInstrumentList);
router.get("/:id", validateObjectId, getInstrument);
router.put("/:id", validateObjectId, validateBody(commonSchema), editInstrument);

export default router;
