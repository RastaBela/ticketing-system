import express from "express";
import {
  getUsers,
  deleteUser,
  getUserById,
  createUser,
  updateUser,
  registerUser,
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/", authMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
