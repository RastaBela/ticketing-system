jest.mock("../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    event: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
    },
  },
}));

jest.mock("../src/events/natsClient", () => ({
  getNatsConnection: jest.fn().mockResolvedValue({
    publish: jest.fn(),
  }),
  stringCodec: {
    encode: jest.fn().mockReturnValue("encoded-data"),
  },
}));

import { createBooking } from "../src/controllers/bookingController";
import { Request, Response } from "express";
import prisma from "../src/lib/prisma";

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));
const mockRes = {
  status: mockStatus,
  json: mockJson,
  send: jest.fn(),
} as unknown as Response;

describe("bookingController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    it("should create booking if authenticated and valid", async () => {
      const mockReq = {
        body: { eventId: "event123", quantity: 2 },
        user: { id: "user123", email: "test@test.com" },
      } as any;

      (prisma.event.findUnique as jest.Mock).mockResolvedValue({
        id: "event123",
        title: "Concert Test",
        price: 50,
        availableTickets: 10,
      });

      (prisma.booking.create as jest.Mock).mockResolvedValue({
        id: "booking123",
        eventId: "event123",
        quantity: 2,
        totalPrice: 100,
        status: "PENDING",
        userId: "user123",
      });

      await createBooking(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ id: "booking123", status: "PENDING" })
      );
    });

    it("should return 403 if not authenticated", async () => {
      const mockReq = {
        body: { eventId: "event123", quantity: 2 },
        user: null,
      } as any;

      await createBooking(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should return 404 if event not found", async () => {
      const mockReq = {
        body: { eventId: "unknown", quantity: 2 },
        user: { id: "user123" },
      } as any;

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await createBooking(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: "Event not found" });
    });

    it("should return 400 if not enough tickets", async () => {
      const mockReq = {
        body: { eventId: "event123", quantity: 5 },
        user: { id: "user123" },
      } as any;

      (prisma.event.findUnique as jest.Mock).mockResolvedValue({
        availableTickets: 2,
      });

      await createBooking(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Not enough tickets available",
      });
    });
  });
});
