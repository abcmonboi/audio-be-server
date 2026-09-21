import { Mood } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendSuccess } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
import { getById } from "@/utils/get-by-id";
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

  return sendSuccess(res, data, { page, pageSize, total });
};

const getMood: RequestHandler = async (req, res) => {
  return getById(req.params, Mood, res);
};

export { createMood, getMoodList, getMood };
