import { createMood, getMoodList } from "@/controllers/mood";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createMood);
router.get("/", validatePagination, getMoodList);

export default router;
