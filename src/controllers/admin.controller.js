import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalHotels, pendingHotels, totalBookings, revenueAgg] =
    await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments({ isApproved: true }),
      Hotel.countDocuments({ isApproved: false, isRejected: false }),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const stats = {
    totalUsers,
    totalHotels,
    pendingHotels,
    totalBookings,
    totalRevenue: revenueAgg[0]?.total || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { stats }, "Dashboard stats fetched"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, { users, total }, "Users fetched"));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be true or false");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, `User ${isActive ? "activated" : "deactivated"}`)
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const getPendingHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ isApproved: false, isRejected: false })
    .populate("owner", "username fullName email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { hotels }, "Pending hotels fetched"));
});

const approveHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (hotel.registrationPaymentStatus !== "paid") {
    throw new ApiError(400, "Hotel registration fee has not been paid yet");
  }

  hotel.isApproved = true;
  hotel.isRejected = false;
  hotel.rejectionReason = undefined;
  await hotel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "Hotel approved successfully"));
});

const rejectHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { reason } = req.body;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  hotel.isApproved = false;
  hotel.isRejected = true;
  hotel.rejectionReason = reason || "Does not meet requirements";
  await hotel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "Hotel rejected"));
});

const getAllBookingsAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("user", "username fullName email")
    .populate("hotel", "name city")
    .populate("room", "roomType")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Booking.countDocuments(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, { bookings, total }, "Bookings fetched"));
});

const getAnalytics = asyncHandler(async (req, res) => {
  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const revenueByMonth = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const topHotels = await Booking.aggregate([
    { $match: { status: { $in: ["confirmed", "completed"] } } },
    { $group: { _id: "$hotel", totalBookings: { $sum: 1 } } },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "hotels",
        localField: "_id",
        foreignField: "_id",
        as: "hotel",
      },
    },
    { $unwind: "$hotel" },
    { $project: { "hotel.name": 1, totalBookings: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { bookingsByStatus, revenueByMonth, topHotels },
        "Analytics fetched"
      )
    );
});

// full accounting overview — platform revenue vs what's owed to each hotel owner
const getAccounting = asyncHandler(async (req, res) => {
  const totals = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalPlatformShare: { $sum: "$platformShare" },
        totalHotelShare: { $sum: "$hotelShare" },
      },
    },
  ]);

  const pendingPayouts = await Payment.aggregate([
    { $match: { status: "success", payoutStatus: "pending" } },
    {
      $group: {
        _id: "$hotel",
        totalPending: { $sum: "$hotelShare" },
        paymentCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "hotels",
        localField: "_id",
        foreignField: "_id",
        as: "hotel",
      },
    },
    { $unwind: "$hotel" },
    {
      $lookup: {
        from: "users",
        localField: "hotel.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        hotelId: "$_id",
        hotelName: "$hotel.name",
        ownerName: "$owner.fullName",
        ownerEmail: "$owner.email",
        totalPending: 1,
        paymentCount: 1,
      },
    },
    { $sort: { totalPending: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRevenue: totals[0]?.totalRevenue || 0,
        totalPlatformShare: totals[0]?.totalPlatformShare || 0,
        totalHotelShare: totals[0]?.totalHotelShare || 0,
        pendingPayouts,
      },
      "Accounting overview fetched"
    )
  );
});

// mark all pending payouts for a hotel as paid (e.g. after an offline bank transfer to the owner)
const markHotelPayoutPaid = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const result = await Payment.updateMany(
    { hotel: hotelId, payoutStatus: "pending", status: "success" },
    { $set: { payoutStatus: "paid" } }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "No pending payouts found for this hotel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedCount: result.modifiedCount },
        "Payout marked as paid for this hotel"
      )
    );
});

export {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getPendingHotels,
  approveHotel,
  rejectHotel,
  getAllBookingsAdmin,
  getAnalytics,
  getAccounting,
  markHotelPayoutPaid,
};
