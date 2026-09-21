import type { RequestHandler } from "express";
import { isObjectIdOrHexString } from "mongoose";

// Route dùng /:id; chỉ chấp nhận chuỗi hex gồm đúng 24 ký tự.
export const validateObjectId: RequestHandler = (req, res, next) => {
  const { id } = req.params;
  if (typeof id !== "string" || !isObjectIdOrHexString(id)) {
    return res.status(400).json({ success: false, msg: "id must be a valid ObjectId" });
  }
  next();
};
