import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "@/utils/app-error";

// Cần đủ 4 tham số để Express nhận diện middleware xử lý lỗi dùng chung cho các route.
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  // Response đã bắt đầu gửi thì chuyển lỗi tiếp, không gửi thêm JSON.
  if (res.headersSent) return next(error);
  if (error instanceof AppError) {
    if (error.retryAfter) res.setHeader("Retry-After", error.retryAfter);
    return res.status(error.status).json({ success: false, code: error.code, msg: error.message });
  }

  // Lỗi đầu vào từ middleware validation: dừng trước controller và trả chung format JSON.
  if (error instanceof ZodError) {
    // Ngăn cách các lỗi bằng ký tự xuống dòng; JSON sẽ biểu diễn ký tự này dưới dạng \n.
    const msg = error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("\n ");
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      msg,
      errors: error.issues.map((issue) => ({ field: issue.path.join("."), msg: issue.message })),
    });
  }

  // Unique index của MongoDB chặn dữ liệu trùng, ví dụ slug đã tồn tại.
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    if (error.keyPattern?.email || error.keyPattern?.mobile) {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        msg: "Email hoặc số điện thoại đã được đăng ký",
      });
    }
    // Title lấy từ request hiện tại, không phải tên của bản ghi đã tồn tại trong DB.
    const slug = error.keyValue?.slug;
    const title = req.body?.title;
    if (typeof slug === "string" && typeof title === "string") {
      return res.status(409).json({
        success: false,
        msg: `Slug "${slug}" cho title "${title.trim()}" đã tồn tại`,
      });
    }

    // keyValue chứa trường và giá trị bị trùng; không trả nguyên lỗi nội bộ của MongoDB.
    const duplicate = Object.entries(error.keyValue ?? {})
      .map(([field, value]) => `${field} ${JSON.stringify(value)}`)
      .join(", ");

    return res.status(409).json({
      success: false,
      msg: duplicate ? `${duplicate} already exists` : "Resource already exists",
    });
  }

  if (error instanceof SyntaxError && "body" in error)
    return res
      .status(400)
      .json({ success: false, code: "VALIDATION_ERROR", msg: "JSON không hợp lệ" });
  return res
    .status(500)
    .json({ success: false, code: "INTERNAL_ERROR", msg: "Đã xảy ra lỗi, vui lòng thử lại sau" });
};
