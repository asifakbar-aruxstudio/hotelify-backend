import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Hotel } from "../models/hotel.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerHotel = asyncHandler(async (req, res) => {
  const { name, description, address, city, country, amenities } = req.body;

  if ([name, description, address, city, country].some((f) => !f?.trim())) {
    throw new ApiError(400, "All required fields must be filled");
  }

  // req.files comes from multer (upload.array("images", 5) on the route)
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadOnCloudinary(file.path))
    );
    imageUrls = uploadResults
      .filter((result) => result !== null)
      .map((result) => result.secure_url);
  }

  // hotel is created as unpaid/unapproved — registrationFee (5000) must be
  // paid via the payments route before isApproved can be set to true
  const hotel = await Hotel.create({
    owner: req.user._id,
    name,
    description,
    address,
    city,
    country,
    amenities: amenities || [],
    images: imageUrls,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        hotel,
        "Hotel created. Please complete the 5000 registration fee to activate your listing."
      )
    );
});

const getAllHotels = asyncHandler(async (req, res) => {
  const { city, minRating, page = 1, limit = 10 } = req.query;

  const filter = { isApproved: true, isActive: true };
  if (city) filter.city = new RegExp(city, "i");
  if (minRating) filter.avgRating = { $gte: Number(minRating) };

  const hotels = await Hotel.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Hotel.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { hotels, total, page: Number(page) }, "Hotels fetched")
    );
});

const getHotelById = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId).populate(
    "owner",
    "username fullName email"
  );

  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  return res.status(200).json(new ApiResponse(200, hotel, "Hotel fetched"));
});

const getMyHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ owner: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, hotels, "Your hotels fetched"));
});

const updateHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (hotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this hotel");
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(
    hotelId,
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedHotel, "Hotel updated successfully"));
});

const deleteHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (
    hotel.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You do not have permission to delete this hotel");
  }

  await Hotel.findByIdAndDelete(hotelId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Hotel deleted successfully"));
});

// admin only — approve a hotel listing (only after registrationPaymentStatus === "paid")
const approveHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (hotel.registrationPaymentStatus !== "paid") {
    throw new ApiError(
      400,
      "Hotel registration fee has not been paid yet"
    );
  }

  hotel.isApproved = true;
  await hotel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "Hotel approved successfully"));
});

export {
  registerHotel,
  getAllHotels,
  getHotelById,
  getMyHotels,
  updateHotel,
  deleteHotel,
  approveHotel,
};
