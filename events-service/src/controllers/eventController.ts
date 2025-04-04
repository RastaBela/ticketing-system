import { Request, Response } from "express";
import { getNatsConnection, stringCodec } from "../events/natsClient";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

import prisma from "../lib/prisma";

/**
 * @description Create a new event
 * @route POST /api/events
 * @access Organizer
 */
export const createEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { title, description, price, date, availableTickets } = req.body;

  if (req.user?.role !== "ORGANIZER") {
    res.status(403).json({ message: "Only organizers can create events" });
    return;
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      price,
      date: new Date(date),
      availableTickets,
      organizerId: req.user.id,
    },
  });

  const nats = await getNatsConnection();
  nats.publish("event.created", stringCodec.encode(JSON.stringify(event)));

  res.status(201).json(event);
};

/**
 * @description Get all events
 * @route GET /api/events
 * @access All
 */
export const getEvents = async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  res.json(events);
};

/**
 * @description Get an event by id
 * @route GET /api/events/:id
 * @access All
 */
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
};

/**
 * @description Update an event
 * @route PUT /api/events/:id
 * @access Organizer
 */
export const updateEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (req.user?.role !== "ORGANIZER" || req.user.id !== existing.organizerId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  const updated = await prisma.event.update({ where: { id }, data });

  const nats = await getNatsConnection();
  nats.publish("event.updated", stringCodec.encode(JSON.stringify(updated)));

  res.json(updated);
};

/**
 * @description Delete an event
 * @route DELETE /api/events/:id
 * @access Organizer
 */
export const deleteEvent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (req.user?.role !== "ORGANIZER" || req.user.id !== existing.organizerId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await prisma.event.delete({ where: { id } });

  const nats = await getNatsConnection();
  nats.publish("event.deleted", stringCodec.encode(JSON.stringify({ id })));

  res.status(204).send();
};
