import { apiGet, apiPost, apiPatch } from './apiConfig';

export const bookingsAPI = {
  // customer's own bookings
  getMyBookings: async () => {
    return await apiGet('/bookings/my-bookings');
  },

  // hotel owner / admin — bookings for a specific hotel
  getHotelBookings: async (hotelId) => {
    return await apiGet(`/bookings/hotel/${hotelId}`);
  },

  getBookingById: async (id) => {
    return await apiGet(`/bookings/${id}`);
  },

  // bookingData: { roomId, checkInDate, checkOutDate, numberOfRooms, guests }
  // bookingCharge (10%) and totalPrice are calculated automatically by the backend
  createBooking: async (bookingData) => {
    return await apiPost('/bookings', bookingData);
  },

  cancelBooking: async (id) => {
    return await apiPatch(`/bookings/${id}/cancel`, {});
  },

  // hotel owner / admin only
  updateBookingStatus: async (id, status) => {
    return await apiPatch(`/bookings/${id}/status`, { status });
  },
};

export const paymentsAPI = {
  getMyPayments: async () => {
    return await apiGet('/payments/my-payments');
  },

  getPaymentById: async (id) => {
    return await apiGet(`/payments/${id}`);
  },

  // paymentData: { bookingId, paymentGateway, transactionId }
  // NOTE: transactionId currently must come from your Stripe/PayPal
  // checkout flow on the frontend — this just records it against the booking
  payForBooking: async (paymentData) => {
    return await apiPost('/payments/booking', paymentData);
  },

  // paymentData: { hotelId, paymentGateway, transactionId } — the 5000 fee
  payHotelRegistrationFee: async (paymentData) => {
    return await apiPost('/payments/hotel-registration', paymentData);
  },
};

// NOTE: the current backend has NO /admin/* routes at all yet.
// AdminDashboard.jsx currently calls these and will fail until an
// admin controller + routes are added on the backend. Until then,
// hotel approval can be done via hotelsAPI.approveHotel(id).
export const adminAPI = {
  getPendingHotels: async () => {
    throw new Error('Admin routes are not implemented on the backend yet.');
  },
  approveHotel: async (id) => {
    throw new Error('Use hotelsAPI.approveHotel() instead — admin-specific routes are not implemented yet.');
  },
};

export default bookingsAPI;
