import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hotel: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfRooms: {
      type: Number,
      required: true,
      default: 1,
    },
    guests: {
      adults: {
        type: Number,
        default: 1,
      },
      children: {
        type: Number,
        default: 0,
      },
    },
    roomPrice: {
      type: Number, // room cost before booking charges (pricePerNight * nights * numberOfRooms)
      required: true,
    },
    bookingChargePercent: {
      type: Number,
      default: 10, // 10% booking charge on every booking
    },
    bookingCharge: {
      type: Number, // calculated amount = roomPrice * 10%
      required: true,
    },
    totalPrice: {
      type: Number, // roomPrice + bookingCharge
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// auto-calculate bookingCharge and totalPrice before saving
bookingSchema.pre("validate", function (next) {
  if (this.roomPrice != null) {
    this.bookingCharge = Number(
      ((this.roomPrice * this.bookingChargePercent) / 100).toFixed(2)
    );
    this.totalPrice = Number((this.roomPrice + this.bookingCharge).toFixed(2));
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
