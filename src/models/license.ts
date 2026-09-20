import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const licenseSchema = new mongoose.Schema({ ...commonFields }, { ...commonOptions });

export default mongoose.model("License", licenseSchema);
