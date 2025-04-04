import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getNatsConnection, stringCodec } from "../events/natsClient";

import prisma from "../lib/prisma";

/**
 * @description Create a booking
 * @route POST /api/bookings/
 * @access Users
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { eventId, quantity } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (event.availableTickets < quantity) {
    res.status(400).json({ message: "Not enough tickets available" });
    return;
  }

  const totalPrice = event.price * quantity;

  const booking = await prisma.booking.create({
    data: {
      userId: userId,
      eventId,
      quantity,
      totalPrice,
      status: "PENDING",
    },
  });

  const nats = await getNatsConnection();
  nats.publish(
    "booking.created",
    stringCodec.encode(
      JSON.stringify({
        id: booking.id,
        eventId: booking.eventId,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        status: booking.status,
        userId: booking.userId,
        email: req.user?.email,
        title: event.title,
      })
    )
  );

  res.status(201).json(booking);
};

/**
 * @description Get the current logged in user's bookings
 * @route GET /api/bookings/my/bookings
 * @access Users
 */
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(bookings);
};

/**
 * @description Get a user's booking
 * @route GET /api/bookings/:id
 * @access Users
 */
export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking || booking.userId !== userId) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  res.json(booking);
};

/**
 * @description Get all bookings
 * @route GET /api/bookings/
 * @access Admin
 */
export const getAllBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Only admins can access all bookings" });
    return;
  }

  const bookings = await prisma.booking.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(bookings);
};

/**
 * @description Update a booking
 * @route PUT /api/bookings/:id
 * @access Self and Admin
 */
export const updateBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { quantity, status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const isOwner = booking.userId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "Unauthorized to update this booking" });
    return;
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { quantity, status },
  });

  res.json(updated);
};

/**
 * @description Delete a booking
 * @route DELETE /api/bookings/:id
 * @access Self and Admin
 */
export const deleteBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const isOwner = booking.userId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "Unauthorized to delete this booking" });
    return;
  }

  await prisma.booking.delete({ where: { id } });

  res.status(204).send();
};
