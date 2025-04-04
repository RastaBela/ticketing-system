jest.mock("../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn().mockResolvedValue({
        id: "user-id-123",
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "hashedpassword123",
        role: "CLIENT",
      }),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

jest.mock("../src/events/natsClient", () => ({
  getNatsConnection: jest.fn().mockResolvedValue({
    publish: jest.fn(),
  }),
  stringCodec: {
    encode: jest.fn().mockReturnValue("mocked"),
  },
}));

import { registerUser, createUser } from "../src/controllers/userController";
import { Request, Response } from "express";

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));

const mockRes = {
  status: mockStatus,
  json: mockJson,
} as unknown as Response;

describe("userController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user and return 201", async () => {
      const mockReq = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          password: "123456",
          role: "CLIENT",
        },
      } as Request;

      await registerUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
          user: expect.objectContaining({
            email: "john@example.com",
            role: "CLIENT",
          }),
        })
      );
    });
  });

  describe("createUser", () => {
    it("should forbid if non-admin tries to create ADMIN", async () => {
      const mockReq = {
        user: { role: "CLIENT" },
        body: { role: "ADMIN" },
      } as any;

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Forbidden action: admin only",
      });
    });
  });
});
