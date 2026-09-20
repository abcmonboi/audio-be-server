import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const videoThemeSchema = new mongoose.Schema({ ...commonFields }, { ...commonOptions });

export default mongoose.model("VideoTheme", videoThemeSchema);
