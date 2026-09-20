import { License } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated, sendPaginatedList } from "@/utils/response";
import { fetchPaginatedList } from "@/utils/list-query";
import type { RequestHandler } from "express";
import type { CommonInput } from "@/validators/common";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(commonSchema) trước controller này.
const createLicense: ValidatedBodyHandler<CommonInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  const newLicense = await License.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newLicense);
};

const getLicenseList: RequestHandler = async (req, res) => {
  const { data, total, page, pageSize } = await fetchPaginatedList(License, req.query);

  return sendPaginatedList(res, data, { page, pageSize, total });
};

export { createLicense, getLicenseList };
