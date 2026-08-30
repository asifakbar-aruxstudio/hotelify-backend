import { apiGet, apiPost, apiPatch, apiDelete } from './apiConfig';

export const hotelsAPI = {
  getAllHotels: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/hotels${queryString ? `?${queryString}` : ''}`;
    return await apiGet(endpoint); // { hotels, total, page }
  },

  getHotelById: async (id) => {
    return await apiGet(`/hotels/${id}`);
  },

  getMyHotels: async () => {
    return await apiGet('/hotels/owner/my-hotels');
  },

  // hotelData: { name, description, address, city, country, amenities }
  // images: array of File objects (optional, max 5)
  createHotel: async (hotelData, images = []) => {
    if (images.length > 0) {
      const formData = new FormData();
      Object.keys(hotelData).forEach((key) => {
        const value = hotelData[key];
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      });
      images.forEach((file) => formData.append('images', file));
      return await apiPost('/hotels', formData, true); // isFormData = true
    }
    // no images — plain JSON works too (registerHotel controller doesn't require files)
    return await apiPost('/hotels', hotelData);
  },

  updateHotel: async (id, hotelData) => {
    return await apiPatch(`/hotels/${id}`, hotelData);
  },

  deleteHotel: async (id) => {
    return await apiDelete(`/hotels/${id}`);
  },

  // admin only
  approveHotel: async (id) => {
    return await apiPatch(`/hotels/${id}/approve`, {});
  },
};

export const roomsAPI = {
  getRoomsByHotel: async (hotelId) => {
    return await apiGet(`/rooms/hotel/${hotelId}`);
  },

  getRoomById: async (id) => {
    return await apiGet(`/rooms/${id}`);
  },

  // roomData: { roomType, description, pricePerNight, capacity, totalRooms, amenities }
  createRoom: async (hotelId, roomData, images = []) => {
    if (images.length > 0) {
      const formData = new FormData();
      Object.keys(roomData).forEach((key) => {
        const value = roomData[key];
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      });
      images.forEach((file) => formData.append('images', file));
      return await apiPost(`/rooms/hotel/${hotelId}`, formData, true);
    }
    return await apiPost(`/rooms/hotel/${hotelId}`, roomData);
  },

  updateRoom: async (id, roomData) => {
    return await apiPatch(`/rooms/${id}`, roomData);
  },

  deleteRoom: async (id) => {
    return await apiDelete(`/rooms/${id}`);
  },
};

export default hotelsAPI;
