import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";
import { Hotel } from "../models/hotel.model.js";

const addRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { roomType, description, pricePerNight, capacity, totalRooms, amenities } =
    req.body;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  if (hotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this hotel");
  }

  if (!roomType || !pricePerNight) {
    throw new ApiError(400, "roomType and pricePerNight are required");
  }

  const room = await Room.create({
    hotel: hotelId,
    roomType,
    description,
    pricePerNight,
    capacity,
    totalRooms: totalRooms || 1,
    amenities: amenities || [],
    images: req.imageUrls || [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, room, "Room added successfully"));
});

const getRoomsByHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const rooms = await Room.find({ hotel: hotelId, isAvailable: true });

  return res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched"));
});

const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId).populate("hotel");
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res.status(200).json(new ApiResponse(200, room, "Room fetched"));
});

const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId).populate("hotel");
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.hotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this room's hotel");
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    roomId,
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Room updated successfully"));
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId).populate("hotel");
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.hotel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this room's hotel");
  }

  await Room.findByIdAndDelete(roomId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Room deleted successfully"));
});

export { addRoom, getRoomsByHotel, getRoomById, updateRoom, deleteRoom };
