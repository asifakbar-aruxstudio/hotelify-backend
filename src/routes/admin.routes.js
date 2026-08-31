import { Router } from "express";
import {
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
} from "../controllers/admin.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// every admin route requires login + admin role
router.use(verifyJWT, authorizeRoles("admin"));

router.route("/dashboard").get(getDashboardStats);
router.route("/analytics").get(getAnalytics);

router.route("/users").get(getAllUsers);
router.route("/users/:userId/status").patch(updateUserStatus);
router.route("/users/:userId").delete(deleteUser);

router.route("/hotels/pending").get(getPendingHotels);
router.route("/hotels/:hotelId/approve").patch(approveHotel);
router.route("/hotels/:hotelId/reject").patch(rejectHotel);

router.route("/bookings").get(getAllBookingsAdmin);

router.route("/accounting").get(getAccounting);
router.route("/hotels/:hotelId/payout").patch(markHotelPayoutPaid);

export default router;
