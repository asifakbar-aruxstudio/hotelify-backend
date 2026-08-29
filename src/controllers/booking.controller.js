import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";
import { Room } from "../models/room.model.js";

const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkInDate, checkOutDate, numberOfRooms, guests } = req.body;

  if (!roomId || !checkInDate || !checkOutDate) {
    throw new ApiError(400, "roomId, checkInDate and checkOutDate are required");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    throw new ApiError(400, "checkOutDate must be after checkInDate");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const roomsRequested = numberOfRooms || 1;

  // check overlapping bookings for this room in the requested date range
  const overlappingBookings = await Booking.aggregate([
    {
      $match: {
        room: room._id,
        status: { $in: ["pending", "confirmed"] },
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
      },
    },
    {
      $group: {
        _id: null,
        totalBooked: { $sum: "$numberOfRooms" },
      },
    },
  ]);

  const alreadyBooked = overlappingBookings[0]?.totalBooked || 0;

  if (alreadyBooked + roomsRequested > room.totalRooms) {
    throw new ApiError(
      409,
      "Not enough rooms available for the selected dates"
    );
  }

  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const roomPrice = room.pricePerNight * nights * roomsRequested;

  // bookingCharge (10%) and totalPrice are auto-calculated in the model's pre-validate hook
  const booking = await Booking.create({
    user: req.user._id,
    hotel: room.hotel,
    room: room._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfRooms: roomsRequested,
    guests,
    roomPrice,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Booking created successfully"));
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("hotel", "name city images")
    .populate("room", "roomType pricePerNight")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Your bookings fetched"));
});

const getHotelBookings = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const bookings = await Booking.find({ hotel: hotelId })
    .populate("user", "username fullName email")
    .populate("room", "roomType")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Hotel bookings fetched"));
});

const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("hotel")
    .populate("room")
    .populate("user", "username fullName email");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return res.status(200).json(new ApiResponse(200, booking, "Booking fetched"));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot cancel this booking");
  }

  if (booking.status === "cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  booking.status = "cancelled";
  await booking.save();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: { status } },
    { new: true }
  );

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking status updated"));
});

export {
  createBooking,
  getMyBookings,
  getHotelBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
