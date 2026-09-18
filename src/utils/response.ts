import type { Response } from "express";

// Trả HTTP 201 cùng format chung khi tạo thành công; T tự suy luận từ data truyền vào.
// Không truyền data thì response chỉ có success và msg.
export const sendCreated = <T = unknown>(res: Response, data?: T) => {
  return res.status(201).json({
    success: true,
    ...(data !== undefined ? { data } : {}),
    msg: "Created successfully",
  });
};
