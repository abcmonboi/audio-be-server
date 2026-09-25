import * as argon2 from "argon2";

export const hashPassword = (password: string) =>
  argon2.hash(password, { type: argon2.argon2id });

export const verifyPassword = (passwordHash: string, password: string) =>
  argon2.verify(passwordHash, password);
