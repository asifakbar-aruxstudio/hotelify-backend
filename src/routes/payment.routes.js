import { Router } from "express";
import {
  payForBooking,
  payHotelRegistrationFee,
  getPaymentById,
  getMyPayments,
} from "../controllers/payment.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// all payment routes require login
router.use(verifyJWT);

router.route("/booking").post(authorizeRoles("customer"), payForBooking);
router
  .route("/hotel-registration")
  .post(authorizeRoles("hotel_owner"), payHotelRegistrationFee);
router.route("/my-payments").get(getMyPayments);
router.route("/:paymentId").get(getPaymentById);

export default router;
