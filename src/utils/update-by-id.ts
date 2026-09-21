import type { Request, Response } from "express";
import type { Model, UpdateQuery } from "mongoose";
import { sendNotFound, sendSuccess } from "@/utils/response";

// Route cần validateObjectId và validateBody; controller chỉ truyền payload đã chọn lọc.
export const updateById = async <T>(
  params: Request["params"],
  payload: UpdateQuery<T>,
  model: Model<T>,
  res: Response,
) => {
  const { id } = params;
  const data = await model.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    // Bật validation theo schema Mongoose cho các trường được cập nhật; mặc định update không chạy validator.
    runValidators: true,
  });

  if (!data) return sendNotFound(res);
  return sendSuccess(res, data, { msg: "Data updated successfully" });
};
