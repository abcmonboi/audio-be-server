import "dotenv/config";

export function parseAppTimezone(value = "Asia/Ho_Chi_Minh"): string {
  // Kiểm tra một lần khi khởi động, không âm thầm dùng timezone của máy server.
  if (!value.trim()) throw new Error("APP_TIMEZONE must be a valid timezone");
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: value.trim() }).resolvedOptions().timeZone;
  } catch {
    throw new Error("APP_TIMEZONE must be a valid timezone");
  }
}

export const APP_TIMEZONE = parseAppTimezone(process.env.APP_TIMEZONE);
