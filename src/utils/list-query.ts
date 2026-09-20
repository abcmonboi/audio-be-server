import type { Request } from "express";
import type { Model } from "mongoose";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { DEFAULT_SORT, excludedFields } from "@/constants/list-query";

type ListQueryOptions = {
  page: number;
  pageSize: number;
  sort?: string;
  fields?: string;
};

// Đọc query params sau validatePagination; sort và fields dùng dấu phẩy phân cách.
const parseListQueryOptions = (query: Request["query"]): ListQueryOptions => ({
  page: Number(query.page ?? DEFAULT_PAGE),
  pageSize: Number(query.pageSize ?? DEFAULT_PAGE_SIZE),
  sort: typeof query.sort === "string" ? query.sort : undefined,
  fields: typeof query.fields === "string" ? query.fields : undefined,
});

// Lấy trang dữ liệu và đếm tổng số bản ghi cùng bộ lọc; cần chạy validatePagination trước.
export const fetchPaginatedList = async <T>(model: Model<T>, queryParams: Request["query"]) => {
  const options = parseListQueryOptions(queryParams);
  // Chỉ loại bốn tham số điều khiển; giữ nguyên các query param còn lại làm bộ lọc.
  const queryFilters = Object.fromEntries(
    Object.entries(queryParams).filter(([field]) => !excludedFields.includes(field)),
  );
  const query = model.find(queryFilters);

  const sortBy = options.sort?.split(/[\s,]+/).filter(Boolean) ?? [];
  // Mặc định lấy bản ghi mới nhất trước khi không có tiêu chí sort.
  if (!sortBy.length) sortBy.push(DEFAULT_SORT);
  // Thêm _id để xác định thứ tự khi các bản ghi trùng giá trị sort, kể cả createdAt.
  if (!sortBy.some((field) => ["_id", "-_id", "+_id"].includes(field))) sortBy.push("_id");
  query.sort(sortBy.join(" "));
  if (options.fields) {
    const fields = options.fields.split(",").join(" ");
    query.select(fields);
  }
  const { page, pageSize } = options;
  const [data, total] = await Promise.all([
    query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec(),
    model.countDocuments(queryFilters).exec(),
  ]);

  return { data, total, page, pageSize };
};
