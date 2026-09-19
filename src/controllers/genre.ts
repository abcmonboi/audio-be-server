import { Genre } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendList } from "@/utils/response";
import { buildListQuery } from "@/utils/list-query";
import type { RequestHandler } from "express";
import type { CreateGenreInput } from "@/validators/genre";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(createGenreSchema) trước controller này.
const createGenre: ValidatedBodyHandler<CreateGenreInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  // Chỉ ghi các trường cần thiết; model kiểm tra các ràng buộc của schema.
  const newGenre = await Genre.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newGenre);
};

const getGenreList: RequestHandler = async (req, res) => {
  // Middleware đã kiểm tra số nguyên dương; mặc định trang 1, mỗi trang 10 bản ghi.
  const options = {
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
    sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    fields: typeof req.query.fields === "string" ? req.query.fields : undefined,
  };

  // Hai truy vấn độc lập: lấy trang hiện tại và đếm tổng số genre.
  const [data, total] = await Promise.all([
    buildListQuery(Genre, {}, options).exec(),
    Genre.countDocuments().exec(),
  ]);

  return sendList(res, data, { page: options.page, pageSize: options.pageSize, total });
};

export { createGenre, getGenreList };
