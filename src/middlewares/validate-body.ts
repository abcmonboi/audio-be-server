import type { RequestHandler } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import type { z } from "zod";

// Controller đọc dữ liệu đã kiểm tra từ locals; req.body vẫn là dữ liệu thô unknown.
export type ValidatedBodyHandler<T> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  { body: T }
>;

// Gắn trước controller tại route. Parse một lần, hỗ trợ cả schema có kiểm tra bất đồng bộ.
export const validateBody = <T extends z.ZodType>(schema: T): ValidatedBodyHandler<z.output<T>> => {
  return async (req, res, next) => {
    // Lỗi Zod được Express 5 chuyển tới errorHandler; controller không chạy khi parse thất bại.
    res.locals.body = await schema.parse(req.body);
    next();
  };
};
