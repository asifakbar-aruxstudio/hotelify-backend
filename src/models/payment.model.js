import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["booking", "hotel_registration"],
      required: true,
      default: "booking",
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking", // only set when type === "booking"
      index: true,
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel", // set for both types — used for accounting per hotel
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number, // total amount charged
      required: true,
    },
    // revenue split — only meaningful for type: "booking"
    // hotel_registration fee is 100% platform revenue (platformShare = amount, hotelShare = 0)
    platformShare: {
      type: Number, // 10% booking charge, or full registration fee
      required: true,
      default: 0,
    },
    hotelShare: {
      type: Number, // 90% room price, owed to the hotel owner
      required: true,
      default: 0,
    },
    payoutStatus: {
      type: String, // whether hotelShare has been paid out to the hotel owner
      enum: ["not_applicable", "pending", "paid"],
      default: "pending",
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentGateway: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true,
    },
    transactionId: {
      type: String, // gateway's payment intent / order id
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
