import { Genre } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendPaginatedList } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
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
  const { data, total, page, pageSize } = await fetchPaginatedList(Genre, req.query);

  return sendPaginatedList(res, data, { page, pageSize, total });
};

export { createGenre, getGenreList };
