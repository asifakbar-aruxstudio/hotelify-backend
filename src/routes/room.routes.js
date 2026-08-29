import { Router } from "express";
import {
  addRoom,
  getRoomsByHotel,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.route("/hotel/:hotelId").get(getRoomsByHotel);
router.route("/:roomId").get(getRoomById);

// secured routes — hotel owner only
router
  .route("/hotel/:hotelId")
  .post(verifyJWT, authorizeRoles("hotel_owner"), addRoom);
router
  .route("/:roomId")
  .patch(verifyJWT, authorizeRoles("hotel_owner"), updateRoom)
  .delete(verifyJWT, authorizeRoles("hotel_owner"), deleteRoom);

export default router;
