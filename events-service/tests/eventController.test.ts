jest.mock("../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
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

import { createEvent, getEvents } from "../src/controllers/eventController";
import { Request, Response } from "express";
import prisma from "../src/lib/prisma";

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));
const mockRes = {
  status: mockStatus,
  json: mockJson,
  send: jest.fn(),
} as unknown as Response;

describe("eventController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create event if user is ORGANIZER", async () => {
      const mockReq = {
        user: { id: "organizer123", role: "ORGANIZER" },
        body: {
          title: "Test Event",
          description: "Cool event",
          price: 30,
          date: "2025-06-01T00:00:00Z",
          availableTickets: 100,
        },
      } as any;

      (prisma.event.create as jest.Mock).mockResolvedValue({
        id: "event123",
        ...mockReq.body,
        organizerId: mockReq.user.id,
      });

      await createEvent(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ id: "event123", title: "Test Event" })
      );
    });

    it("should return 403 if user is not an organizer", async () => {
      const mockReq = {
        user: { id: "client456", role: "CLIENT" },
        body: {},
      } as any;

      await createEvent(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Only organizers can create events",
      });
    });
  });

  describe("getEvents", () => {
    it("should return list of events", async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([
        { id: "e1", title: "A" },
        { id: "e2", title: "B" },
      ]);

      await getEvents({} as Request, mockRes);

      expect(mockJson).toHaveBeenCalledWith([
        { id: "e1", title: "A" },
        { id: "e2", title: "B" },
      ]);
    });
  });
});
