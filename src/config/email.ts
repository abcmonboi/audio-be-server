import { z } from "zod";

const schema = z.object({
  FRONTEND_URL: z.url().refine((value) => {
    const url = new URL(value);
    return (
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    );
  }),
  EMAIL_TOKEN_KEY_ID: z.string().min(1),
  EMAIL_TOKEN_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.email(),
});
export type EmailConfig = z.infer<typeof schema>;
export function getEmailConfig(): EmailConfig {
  const result = schema.safeParse(process.env);
  // Không đưa giá trị secret hoặc ZodError gốc vào log startup.
  if (!result.success)
    throw new Error(
      `Invalid email configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  return result.data;
}
