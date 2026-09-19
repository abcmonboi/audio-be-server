import type { Response } from "express";

// total chỉ có khi controller chủ động đếm tổng số bản ghi khớp bộ lọc.
type Pagination = { page: number; pageSize: number; total?: number };

export const sendList = <T>(res: Response, data: T[], pagination: Pagination) => {
  return res.status(200).json({ success: true, data, pagination, msg: "Fetched successfully" });
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
