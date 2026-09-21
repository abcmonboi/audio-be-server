import type { Request, Response } from "express";
import type { Model } from "mongoose";
import { sendNotFound, sendSuccess } from "@/utils/response";

// Route cần gắn validateObjectId trước khi gọi hàm này.
export const getById = async <T>(params: Request["params"], model: Model<T>, res: Response) => {
  const { id } = params;
  const data = await model.findById(id);
  if (!data) return sendNotFound(res);
  return sendSuccess(res, data);
};
