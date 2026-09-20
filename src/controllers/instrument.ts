import { Instrument } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendPaginatedList } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
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

  return sendPaginatedList(res, data, { page, pageSize, total });
};

export { createInstrument, getInstrumentList };
