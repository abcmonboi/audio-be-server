import type { Response } from "express";

export const sendNotFound = (res: Response, msg = "Resource not found") => {
  return res.status(404).json({ success: false, msg });
};

// total là tổng số bản ghi khớp bộ lọc, nếu được cung cấp.
type Pagination = { page: number; pageSize: number; total?: number };

type SuccessOptions = { pagination?: Pagination; msg?: string };

// Trả HTTP 200 cùng dữ liệu và thông tin phân trang nếu được truyền vào; hàm không tự phân trang dữ liệu.
export const sendSuccess = <T>(res: Response, data: T, options: SuccessOptions = {}) => {
  const { pagination, msg = "Fetched successfully" } = options;
  return res.status(200).json({ success: true, data, ...pagination, msg });
};

// Trả HTTP 201 cùng format chung khi tạo thành công; T tự suy luận từ data truyền vào.
// Không truyền data thì response chỉ có success và msg.
export const sendCreated = <T = unknown>(res: Response, data?: T) => {
  return res.status(201).json({
    success: true,
    ...(data !== undefined ? { data } : {}),
    msg: "Created successfully",
  });
};
