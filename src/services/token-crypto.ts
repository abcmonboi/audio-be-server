import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getEmailConfig, type EmailConfig } from "@/config/email";

export type EncryptedToken = { ciphertext: string; iv: string; tag: string; keyId: string };
export const generateToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function encryptToken(
  token: string,
  config: EmailConfig = getEmailConfig(),
): EncryptedToken {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(config.EMAIL_TOKEN_KEY, "hex"), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    keyId: config.EMAIL_TOKEN_KEY_ID,
  };
}

export function decryptToken(token: EncryptedToken, config: EmailConfig = getEmailConfig()) {
  if (token.keyId !== config.EMAIL_TOKEN_KEY_ID) throw new Error("Unknown encryption key");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(config.EMAIL_TOKEN_KEY, "hex"),
    Buffer.from(token.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(token.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(token.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
