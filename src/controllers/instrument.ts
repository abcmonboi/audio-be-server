import { Instrument } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendSuccess } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
import { getById } from "@/utils/get-by-id";
import { updateById } from "@/utils/update-by-id";
import type { RequestHandler } from "express";
import type { CommonInput } from "@/validators/common";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(commonSchema) trước controller này.
const createInstrument: ValidatedBodyHandler<CommonInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  const newInstrument = await Instrument.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newInstrument);
};

const getInstrumentList: RequestHandler = async (req, res) => {
  const { data, total, page, pageSize } = await fetchPaginatedList(Instrument, req.query);

  return sendSuccess(res, data, { pagination: { page, pageSize, total } });
};

const getInstrument: RequestHandler = async (req, res) => {
  return getById(req.params, Instrument, res);
};

const editInstrument: ValidatedBodyHandler<CommonInput> = async (req, res) => {
  const { title, description } = res.locals.body;
  const payload = {
    title,
    description,
    slug: createSlug(title),
  };

  return updateById(req.params, payload, Instrument, res);
};

export { createInstrument, getInstrumentList, getInstrument, editInstrument };
