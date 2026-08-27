import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    roomType: {
      type: String,
      required: true, // e.g. "Deluxe", "Standard", "Suite"
    },
    description: {
      type: String,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    capacity: {
      adults: {
        type: Number,
        required: true,
        default: 1,
      },
      children: {
        type: Number,
        default: 0,
      },
    },
    totalRooms: {
      type: Number, // how many rooms of this type exist
      required: true,
      default: 1,
    },
    amenities: {
      type: [String], // e.g. ["AC", "TV", "minibar"]
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
