import { createMood, editMood, getMood, getMoodList } from "@/controllers/mood";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createMood);
router.get("/", validatePagination, getMoodList);
router.get("/:id", validateObjectId, getMood);
router.put("/:id", validateObjectId, validateBody(commonSchema), editMood);

export default router;
