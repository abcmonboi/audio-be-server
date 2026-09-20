import type { Response } from "express";

// total là tổng số bản ghi khớp bộ lọc, nếu được cung cấp.
type Pagination = { page: number; pageSize: number; total?: number };

// Trả HTTP 200 cùng danh sách và thông tin phân trang được truyền vào; hàm không tự phân trang dữ liệu.
export const sendPaginatedList = <T>(res: Response, data: T[], pagination: Pagination) => {
  return res.status(200).json({ success: true, data, ...pagination, msg: "Fetched successfully" });
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
