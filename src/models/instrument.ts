import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const instrumentSchema = new mongoose.Schema({ ...commonFields }, { ...commonOptions });

export default mongoose.model("Instrument", instrumentSchema);
