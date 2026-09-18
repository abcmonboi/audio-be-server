import { commonSchema } from "@/validators/common";
import type { z } from "zod";

// Genre hiện chỉ cần các trường chung; khi có trường riêng có thể dùng commonSchema.extend({...}).
export const createGenreSchema = commonSchema;

// Suy luận type từ schema để không phải khai báo lại các trường cho controller.
export type CreateGenreInput = z.output<typeof createGenreSchema>;
