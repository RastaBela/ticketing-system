import express from "express";
import { processPayment } from "../controllers/paymentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Simulate a payment for a booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Booking ID is required
 *       500:
 *         description: Error processing payment
 */
router.post("/", authMiddleware, processPayment);
export default router;
