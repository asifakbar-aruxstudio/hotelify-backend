import { Router } from "express";
import {
  registerHotel,
  getAllHotels,
  getHotelById,
  getMyHotels,
  updateHotel,
  deleteHotel,
  approveHotel,
} from "../controllers/hotel.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// public routes
router.route("/").get(getAllHotels);
router.route("/:hotelId").get(getHotelById);

// secured routes — hotel owner
router
  .route("/")
  .post(
    verifyJWT,
    authorizeRoles("hotel_owner"),
    upload.array("images", 5),
    registerHotel
  );
router.route("/owner/my-hotels").get(verifyJWT, authorizeRoles("hotel_owner"), getMyHotels);
router
  .route("/:hotelId")
  .patch(verifyJWT, authorizeRoles("hotel_owner"), updateHotel)
  .delete(verifyJWT, authorizeRoles("hotel_owner", "admin"), deleteHotel);

// secured routes — admin only
router
  .route("/:hotelId/approve")
  .patch(verifyJWT, authorizeRoles("admin"), approveHotel);

export default router;
