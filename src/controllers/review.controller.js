import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Booking } from "../models/booking.model.js";
import { Hotel } from "../models/hotel.model.js";

const recalculateHotelRating = async (hotelId) => {
  const stats = await Review.aggregate([
    { $match: { hotel: hotelId } },
    {
      $group: {
        _id: "$hotel",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Hotel.findByIdAndUpdate(hotelId, {
    avgRating: stats[0]?.avgRating?.toFixed(1) || 0,
    totalReviews: stats[0]?.totalReviews || 0,
  });
};

const addReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    throw new ApiError(400, "bookingId and rating are required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only review your own bookings");
  }

  if (booking.status !== "completed") {
    throw new ApiError(400, "You can only review completed stays");
  }

  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this booking");
  }

  const review = await Review.create({
    user: req.user._id,
    hotel: booking.hotel,
    booking: bookingId,
    rating,
    comment,
  });

  await recalculateHotelRating(booking.hotel);

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

const getHotelReviews = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const reviews = await Review.find({ hotel: hotelId })
    .populate("user", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Hotel reviews fetched"));
});

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own review");
  }

  review.rating = rating ?? review.rating;
  review.comment = comment ?? review.comment;
  await review.save();

  await recalculateHotelRating(review.hotel);

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You do not have permission to delete this review");
  }

  const hotelId = review.hotel;
  await Review.findByIdAndDelete(reviewId);
  await recalculateHotelRating(hotelId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export { addReview, getHotelReviews, updateReview, deleteReview };
