import mongoose, { Schema } from "mongoose";

const hotelSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
    },
    location: {
      // for map / nearby search
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    amenities: {
      type: [String], // e.g. ["wifi", "pool", "parking", "gym"]
      default: [],
    },
    images: {
      type: [String], // cloudinary urls
      default: [],
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean, // admin approves before hotel goes live
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationFee: {
      type: Number,
      default: 5000, // flat fee charged to hotel owner on registration
    },
    registrationPaymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    registrationTransactionId: {
      type: String, // stripe/paypal transaction id for the 5000 fee
    },
  },
  { timestamps: true }
);

hotelSchema.index({ location: "2dsphere" });

export const Hotel = mongoose.model("Hotel", hotelSchema);