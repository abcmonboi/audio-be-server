import { VideoTheme } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendSuccess } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
import { getById } from "@/utils/get-by-id";
import { deleteById } from "@/utils/delete-by-id";
import { updateById } from "@/utils/update-by-id";
import type { RequestHandler } from "express";
import type { CommonInput } from "@/validators/common";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(commonSchema) trước controller này.
const createVideoTheme: ValidatedBodyHandler<CommonInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  const newVideoTheme = await VideoTheme.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newVideoTheme);
};

const getVideoThemeList: RequestHandler = async (req, res) => {
  const { data, total, page, pageSize } = await fetchPaginatedList(VideoTheme, req.query);

  return sendSuccess(res, data, { pagination: { page, pageSize, total } });
};

const getVideoTheme: RequestHandler = async (req, res) => {
  return getById(req.params, VideoTheme, res);
};

const editVideoTheme: ValidatedBodyHandler<CommonInput> = async (req, res) => {
  const { title, description } = res.locals.body;
  const payload = {
    title,
    description,
    slug: createSlug(title),
  };

  return updateById(req.params, payload, VideoTheme, res);
};

const deleteVideoTheme: RequestHandler = async (req, res) =>
  deleteById(req.params, VideoTheme, res);

export { createVideoTheme, getVideoThemeList, getVideoTheme, editVideoTheme, deleteVideoTheme };
