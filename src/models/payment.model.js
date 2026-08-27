import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
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
