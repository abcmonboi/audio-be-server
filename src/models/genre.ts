import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const genreSchema = new mongoose.Schema(
  { ...commonFields },
  { ...commonOptions },
);

export default mongoose.model("Genre", genreSchema);
