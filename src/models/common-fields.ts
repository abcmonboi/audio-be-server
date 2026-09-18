import type { InferRawDocType } from "mongoose";

export const commonFields = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    // need handle if title same name
    unique: true,
    lowercase: true,
  },
  description: String,
} as const;

export type CommonFields = InferRawDocType<typeof commonFields>;

export const commonOptions = {
  timestamps: true,
} as const;
