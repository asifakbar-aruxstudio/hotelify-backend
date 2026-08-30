import api from "../api/axios";

// hotelData is a plain object: { name, description, address, city, country, amenities }
// images is an array of File objects from an <input type="file" multiple />
export const registerHotel = async (hotelData, images) => {
  const formData = new FormData();
  Object.keys(hotelData).forEach((key) => formData.append(key, hotelData[key]));
  if (images && images.length > 0) {
    images.forEach((file) => formData.append("images", file));
  }

  const res = await api.post("/hotels", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getAllHotels = async (params = {}) => {
  const res = await api.get("/hotels", { params });
  return res.data;
};

export const getHotelById = async (hotelId) => {
  const res = await api.get(`/hotels/${hotelId}`);
  return res.data;
};

export const addRoom = async (hotelId, roomData, images) => {
  const formData = new FormData();
  Object.keys(roomData).forEach((key) => formData.append(key, roomData[key]));
  if (images && images.length > 0) {
    images.forEach((file) => formData.append("images", file));
  }

  const res = await api.post(`/rooms/hotel/${hotelId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const createBooking = async (bookingData) => {
  const res = await api.post("/bookings", bookingData);
  return res.data;
};
