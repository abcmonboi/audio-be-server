import { z } from "zod";

export const registerSchema = z.strictObject({
  firstname: z.string().trim().min(1).max(100),
  lastname: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  mobile: z.string().trim().min(1).max(32),
  password: z.string().min(15).max(128), // Không trim
  dateOfBirth: z.string().optional(),
});

export const verifyEmailSchema = z.strictObject({
  token: z.string().min(1),
});
export type RegisterInput = z.output<typeof registerSchema>;
export type VerifyEmailInput = z.output<typeof verifyEmailSchema>;
