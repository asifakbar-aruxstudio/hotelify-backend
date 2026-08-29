import { Router } from "express";
import {
  addReview,
  getHotelReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// public route
router.route("/hotel/:hotelId").get(getHotelReviews);

// secured routes — customer only
router.route("/").post(verifyJWT, authorizeRoles("customer"), addReview);
router
  .route("/:reviewId")
  .patch(verifyJWT, authorizeRoles("customer"), updateReview)
  .delete(verifyJWT, deleteReview);

export default router;
