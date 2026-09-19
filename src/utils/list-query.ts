import type { Model } from "mongoose";

type ListQueryOptions = {
  page: number;
  pageSize: number;
  sort?: string;
  fields?: string;
};

// Dựng query sau khi kiểm tra phân trang; sort và fields dùng dấu phẩy phân cách.
export const buildListQuery = <T>(
  model: Model<T>,
  filters: Record<string, string>,
  options: ListQueryOptions,
) => {
  const query = model.find(filters);
  const sort =
    options.sort
      ?.split(",")
      .map((field) => field.trim())
      .filter(Boolean) ?? [];
  // Thêm _id làm tiêu chí cuối để phân trang ổn định khi các trường sort khác bằng nhau.
  query.sort(
    [...sort, ...(sort.some((field) => field === "_id" || field === "-_id") ? [] : ["_id"])].join(
      " ",
    ),
  );
  if (options.fields) query.select(options.fields.split(",").join(" "));
  return query.skip((options.page - 1) * options.pageSize).limit(options.pageSize);
};
