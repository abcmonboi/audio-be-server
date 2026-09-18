import slugify from "slugify";

// Dùng chung cấu hình slug: chữ thường, bỏ ký tự đặc biệt và hỗ trợ tiếng Việt.
export const createSlug = (title: string): string => {
  return slugify(title, { lower: true, strict: true, locale: "vi" });
};
