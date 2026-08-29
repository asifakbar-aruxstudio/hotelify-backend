import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Booking } from "../models/booking.model.js";
import { Hotel } from "../models/hotel.model.js";

// NOTE: replace the stubbed transactionId with a real Stripe/PayPal
// payment-intent / order creation call in your payment gateway integration.

const payForBooking = asyncHandler(async (req, res) => {
  const { bookingId, paymentGateway, transactionId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot pay for this booking");
  }

  if (booking.paymentStatus === "paid") {
    throw new ApiError(400, "This booking is already paid for");
  }

  const payment = await Payment.create({
    booking: booking._id,
    user: req.user._id,
    amount: booking.totalPrice, // includes the 10% booking charge
    paymentGateway,
    transactionId,
    status: "success", // set from gateway webhook/response in real integration
  });

  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  await booking.save();

  return res
    .status(201)
    .json(new ApiResponse(201, payment, "Booking payment successful"));
});

const payHotelRegistrationFee = asyncHandler(async (req, res) => {
  const { hotelId, paymentGateway, transactionId } = req.body;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (hotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this hotel");
  }

  if (hotel.registrationPaymentStatus === "paid") {
    throw new ApiError(400, "Registration fee already paid");
  }

  const payment = await Payment.create({
    // registration fee isn't tied to a Booking — store hotelId via booking-less record
    booking: hotel._id, // reused as a reference id; keep a separate Payment.type if you extend this later
    user: req.user._id,
    amount: hotel.registrationFee, // 5000
    paymentGateway,
    transactionId,
    status: "success",
  });

  hotel.registrationPaymentStatus = "paid";
  hotel.registrationTransactionId = transactionId;
  await hotel.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { hotel, payment },
        "Hotel registration fee paid successfully. Awaiting admin approval."
      )
    );
});

const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId).populate("booking");
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return res.status(200).json(new ApiResponse(200, payment, "Payment fetched"));
});

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Your payments fetched"));
});

export {
  payForBooking,
  payHotelRegistrationFee,
  getPaymentById,
  getMyPayments,
};
