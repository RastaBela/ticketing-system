jest.mock("../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    authUser: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake-jwt-token"),
}));

import { loginUser } from "../src/controllers/authController";
import { Request, Response } from "express";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));

const mockRes = {
  status: mockStatus,
  json: mockJson,
} as unknown as Response;

describe("authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return token if credentials are valid", async () => {
    const mockReq = {
      body: { email: "john@example.com", password: "password123" },
    } as Request;

    (prisma.authUser.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id-123",
      email: "john@example.com",
      password: "hashed-password",
      role: "CLIENT",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await loginUser(mockReq, mockRes);

    expect(mockJson).toHaveBeenCalledWith({ token: "fake-jwt-token" });
  });

  it("should return 401 for invalid credentials", async () => {
    const mockReq = {
      body: { email: "wrong@example.com", password: "wrongpass" },
    } as Request;

    (prisma.authUser.findUnique as jest.Mock).mockResolvedValue(null);

    await loginUser(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Invalid email or password",
    });
  });

  it("should return 500 if error thrown", async () => {
    const mockReq = {
      body: { email: "error@example.com", password: "errorpass" },
    } as Request;

    (prisma.authUser.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    await loginUser(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Error while signing in",
    });
  });
});
