import { createMood, getMood, getMoodList } from "@/controllers/mood";
import { validateObjectId } from "@/middlewares/validate-object-id";
import { validatePagination } from "@/middlewares/validate-pagination";
import { Router } from "express";
import { validateBody } from "@/middlewares/validate-body";
import { commonSchema } from "@/validators/common";

const router = Router();

router.post("/", validateBody(commonSchema), createMood);
router.get("/", validatePagination, getMoodList);
router.get("/:id", validateObjectId, getMood);

export default router;
