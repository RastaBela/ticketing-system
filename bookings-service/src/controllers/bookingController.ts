import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getNatsConnection, stringCodec } from "../events/natsClient";

const prisma = new PrismaClient();

/**
 * @description Create a booking
 * @route POST /api/bookings/
 * @access Users
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    const { userId, eventId, quantity, totalPrice, status, createdAt } =
      req.body;

    const booking = await prisma.booking.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPrice,
        status,
        createdAt: new Date(createdAt),
      },
    });

    res.status(201).json({ message: "Booking successfully created", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while creating the booking", error });
  }
};

/**
 * @description Update a booking
 * @route PUT /api/bookings/:id
 * @access Users
 */
export const updateBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    if (req.user.id !== req.params.userId) {
      res.status(403).json({
        message: "Unauthorized: a user can only update its own booking",
      });
      return;
    }

    const { quantity, totalPrice, status } = req.body;
    const id = req.params.id;

    const updatedBooking = await prisma.booking.update({
      data: { quantity, totalPrice, status },
      where: { id },
    });

    res.status(200).json({
      message: "Booking has been successfully updated",
      updatedBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while updating the booking", error });
  }
};

/**
 * @description Get all bookings
 * @route GET /api/bookings/
 * @access Admin
 */
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    if (req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ message: "Forbidden: only admin can perform this action" });
      return;
    }

    const bookings = prisma.booking.findMany();
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while getting the bookings", error });
  }
};

/**
 * @description Get own bookings
 * @route GET /api/bookings/my/bookings
 * @access Self
 */
export const getOwnBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    const userId = req.params.userId;
    const bookings = prisma.booking.findMany({ where: { userId } });

    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while getting the bookings", error });
  }
};

/**
 * @description Get user's bookings
 * @route GET /api/bookings/user/:id
 * @access Admin
 */
export const getBookingsByUserId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ message: "Forbidden: only admin can perform this action" });
      return;
    }

    const userId = req.params.id;
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
    });

    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while getting user's bookings", error });
  }
};

/**
 * @description Delete a booking
 * @route DELETE /api/bookings/:id
 * @access Admin
 */
export const deleteBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    if (req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ message: "Forbidden: only admin can perform this action" });
      return;
    }

    const id = req.params.id;
    await prisma.booking.delete({ where: { id } });
    res.json({ message: "The booking has been successfully deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while deleting the booking", error });
  }
};

/**
 * @description Delete own booking
 * @route DELETE /api/bookings/my/booking/:id
 * @access Self
 */
export const deleteOwnBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: user is not authentified" });
      return;
    }

    const id = req.params.id;
    const userId = req.user.id;

    const bookingToBeDeleted = await prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!bookingToBeDeleted) {
      res.status(404).json({ message: "This booking doesn't exist" });
      return;
    }

    await prisma.booking.delete({ where: { id } });

    res.json({ message: "The booking has been successfully deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while deleting the booking", error });
  }
};
