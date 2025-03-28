import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, createEvent);
router.put("/:id", authMiddleware, updateEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.delete("/:id", authMiddleware, deleteEvent);

export default router;
