import { License } from "@/models/index";
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

  return sendSuccess(res, data, { pagination: { page, pageSize, total } });
};

const getLicense: RequestHandler = async (req, res) => {
  return getById(req.params, License, res);
};

const editLicense: ValidatedBodyHandler<CommonInput> = async (req, res) => {
  const { title, description } = res.locals.body;
  const payload = {
    title,
    description,
    slug: createSlug(title),
  };

  return updateById(req.params, payload, License, res);
};

const deleteLicense: RequestHandler = async (req, res) => deleteById(req.params, License, res);

export { createLicense, getLicenseList, getLicense, editLicense, deleteLicense };
