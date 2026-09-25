import { Router } from "express";
import { register, verifyEmail } from "@/controllers/user";
import { registerSchema, verifyEmailSchema } from "@/validators/register";
import { validateBody } from "@/middlewares/validate-body";

const router = Router();
router.post("/register", validateBody(registerSchema), register);
router.post("/email-verification/verify", validateBody(verifyEmailSchema), verifyEmail);

export default router;
