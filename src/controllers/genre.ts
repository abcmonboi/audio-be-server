import { Genre } from "@/models/index";
import { createSlug } from "@/utils/slug";
import { sendCreated } from "@/utils/response";
import type { CreateGenreInput } from "@/validators/genre";
import type { ValidatedBodyHandler } from "@/middlewares/validate-body";

// Route phải gắn validateBody(createGenreSchema) trước controller này.
const createGenre: ValidatedBodyHandler<CreateGenreInput> = async (_req, res) => {
  const { title, description } = res.locals.body;

  // Chỉ ghi các trường cần thiết; model kiểm tra các ràng buộc của schema.
  const newGenre = await Genre.create({
    title,
    slug: createSlug(title),
    description,
  });

  return sendCreated(res, newGenre);
};

export { createGenre };
