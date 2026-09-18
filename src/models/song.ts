import mongoose from "mongoose";
import { commonFields, commonOptions } from "@/models/common-fields";

const nonNegativeInteger = {
  type: Number,
  min: 0,
  validate: Number.isSafeInteger,
} as const;

const counter = { ...nonNegativeInteger, default: 0 } as const;

const songSchema = new mongoose.Schema(
  {
    ...commonFields,
    isrc: { type: String, trim: true, uppercase: true },
    streamUrl: String,
    thumbnailUrl: String,
    coverImageUrl: String,
    musicVideoUrl: String,

    // Preview: evenly spaced windows across the entire recording, one
    // maximum absolute amplitude (0..1, all channels) per window.
    waveformPeaks: {
      type: [{ type: Number, min: 0, max: 1 }],
      default: undefined,
      validate: {
        validator: (peaks: number[]) =>
          Array.isArray(peaks) &&
          peaks.length > 0 &&
          peaks.length <= 2048 &&
          peaks.every(Number.isFinite),
        message: "Waveform preview must contain 1 to 2048 finite peaks.",
      },
    },
    waveformStatus: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },

    hashtags: [{ type: String, trim: true, lowercase: true }],
    priceMinor: nonNegativeInteger,
    currency: { type: String, trim: true, uppercase: true, match: /^[A-Z]{3}$/ },
    bpm: {
      type: Number,
      validate: {
        validator: (value: number) => Number.isFinite(value) && value > 0,
        message: "BPM must be a positive finite number.",
      },
    },
    // Leave unset until audio metadata has been extracted.
    durationMs: { ...nonNegativeInteger, min: 1 },
    likeCount: counter,
    playCount: counter,
    ratingCount: counter,
    ratingSum: { type: Number, min: 0, default: 0, validate: Number.isFinite },
    viewCount: counter,
    downloadCount: counter,

    publicationStatus: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: Date,
  },
  { ...commonOptions },
);

export default mongoose.model("Song", songSchema);
