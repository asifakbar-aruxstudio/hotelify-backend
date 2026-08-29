import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getHotelBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// all booking routes require login
router.use(verifyJWT);

router.route("/").post(authorizeRoles("customer"), createBooking);
router.route("/my-bookings").get(authorizeRoles("customer"), getMyBookings);
router
  .route("/hotel/:hotelId")
  .get(authorizeRoles("hotel_owner", "admin"), getHotelBookings);
router.route("/:bookingId").get(getBookingById);
router
  .route("/:bookingId/cancel")
  .patch(authorizeRoles("customer"), cancelBooking);
router
  .route("/:bookingId/status")
  .patch(authorizeRoles("hotel_owner", "admin"), updateBookingStatus);

export default router;
