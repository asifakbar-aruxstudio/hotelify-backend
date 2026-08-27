import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking", // ensures review only from someone who actually booked
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// prevent same user reviewing same booking twice
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
