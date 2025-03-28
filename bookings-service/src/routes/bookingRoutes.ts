import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createBooking,
  deleteBooking,
  deleteOwnBooking,
  getBookings,
  getBookingsByUserId,
  getOwnBookings,
  updateBooking,
} from "../controllers/bookingController";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.put("/:id", authMiddleware, updateBooking);
router.get("/", authMiddleware, getBookings);
router.get("/user/:id", authMiddleware, getBookingsByUserId);
router.get("/my/bookings", authMiddleware, getOwnBookings);
router.delete("/:id", authMiddleware, deleteBooking);
router.delete("/my/booking/:id", authMiddleware, deleteOwnBooking);

export default router;
