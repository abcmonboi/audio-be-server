import { Mood } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendSuccess } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
import { getById } from "@/utils/get-by-id";
import { updateById } from "@/utils/update-by-id";
import type { RequestHandler } from "express";
import type { CommonInput } from "@/validators/common";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(commonSchema) trước controller này.
const createMood: ValidatedBodyHandler<CommonInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  const newMood = await Mood.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newMood);
};

const getMoodList: RequestHandler = async (req, res) => {
  const { data, total, page, pageSize } = await fetchPaginatedList(Mood, req.query);

  return sendSuccess(res, data, { pagination: { page, pageSize, total } });
};

const getMood: RequestHandler = async (req, res) => {
  return getById(req.params, Mood, res);
};

const editMood: ValidatedBodyHandler<CommonInput> = async (req, res) => {
  const { title, description } = res.locals.body;
  const payload = {
    title,
    description,
    slug: createSlug(title),
  };

  return updateById(req.params, payload, Mood, res);
};

export { createMood, getMoodList, getMood, editMood };
