import { z } from "zod";

// Schema đầu vào dùng chung: title bắt buộc, description tùy chọn.
// Slug do server tạo; z.object bỏ qua các trường không được khai báo từ client.
export const commonSchema = z.object({
  title: z
    .string({ error: "title phải là chuỗi và không được bỏ trống" })
    .trim()
    .min(1, "title không được để trống"),
  description: z.string({ error: "description phải là chuỗi" }).optional(),
});
