import type { RequestHandler } from "express";

// Chỉ kiểm tra khi client gửi page/pageSize; controller dùng mặc định nếu không có.
export const validatePagination: RequestHandler = (req, res, next) => {
  for (const field of ["page", "pageSize"] as const) {
    const value = req.query[field];
    if (value === undefined) continue;

    // Phân trang cần số nguyên dương; từ chối chuỗi rỗng và query key bị lặp thành mảng.
    if (typeof value !== "string" || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) {
      return res.status(400).json({ success: false, msg: `${field} phải là số nguyên dương` });
    }
  }
  next();
};
