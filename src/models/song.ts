import mongoose from "mongoose";
import { commonFields } from "@/models/common-fields";

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
    stream_url: String,
    thumbnail_url: String,
    cover_image_url: String,
    music_video_url: String,

    // Preview: evenly spaced windows across the entire recording, one
    // maximum absolute amplitude (0..1, all channels) per window.
    waveform_peaks: {
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
    waveform_status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },

    hashtags: [{ type: String, trim: true, lowercase: true }],
    price_minor: nonNegativeInteger,
    currency: { type: String, trim: true, uppercase: true, match: /^[A-Z]{3}$/ },
    bpm: {
      type: Number,
      validate: {
        validator: (value: number) => Number.isFinite(value) && value > 0,
        message: "BPM must be a positive finite number.",
      },
    },
    // Leave unset until audio metadata has been extracted.
    duration_ms: { ...nonNegativeInteger, min: 1 },
    like_count: counter,
    play_count: counter,
    rating_count: counter,
    rating_sum: { type: Number, min: 0, default: 0, validate: Number.isFinite },
    view_count: counter,
    download_count: counter,

    publication_status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    published_at: Date,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default mongoose.model("Song", songSchema);
