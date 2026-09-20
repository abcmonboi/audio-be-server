import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const moodSchema = new mongoose.Schema({ ...commonFields }, { ...commonOptions });

export default mongoose.model("Mood", moodSchema);
