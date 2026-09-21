import { Genre } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendSuccess } from "@/utils/response";
import { getById } from "@/utils/get-by-id";
import { deleteById } from "@/utils/delete-by-id";
import { updateById } from "@/utils/update-by-id";
import { fetchPaginatedList } from "@/utils/list-query";
import type { RequestHandler } from "express";
import type { CommonInput } from "@/validators/common";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(commonSchema) trước controller này.
const createGenre: ValidatedBodyHandler<CommonInput> = async (_req, res) => {
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

  return sendSuccess(res, data, { pagination: { page, pageSize, total } });
};

const getGenre: RequestHandler = async (req, res) => getById(req.params, Genre, res);

const editGenre: ValidatedBodyHandler<CommonInput> = async (req, res) => {
  const { title, description } = res.locals.body;
  const payload = {
    title,
    description,
    slug: createSlug(title),
  };

  return updateById(req.params, payload, Genre, res);
};

const deleteGenre: RequestHandler = async (req, res) => deleteById(req.params, Genre, res);

export { createGenre, getGenreList, getGenre, editGenre, deleteGenre };
