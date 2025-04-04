import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getNatsConnection, stringCodec } from "../events/natsClient";

import prisma from "../lib/prisma";

/**
 * @description Register a new user
 * @route POST /api/users/register
 * @access All
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstname, lastname, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstname, lastname, email, password: hashedPassword, role },
    });

    const nats = await getNatsConnection();
    nats.publish(
      "user.created",
      stringCodec.encode(
        JSON.stringify({
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
        })
      )
    );

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.log("🔥 ERROR in registerUser:", error); // 👈
    res.status(500).json({ message: "Error while registering the user" });
  }
};

/**
 * @description Create a new user
 * @route POST /api/users
 * @access Admin
 */
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // A non admin user can't create another admin user
    if (!req.user || req.user.role !== "ADMIN") {
      if (req.body.role == "ADMIN") {
        res.status(403).json({ message: "Forbidden action: admin only" });
        return;
      }
    }

    const { firstname, lastname, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstname, lastname, email, password: hashedPassword, role },
    });

    const nats = await getNatsConnection();
    nats.publish(
      "user.created",
      stringCodec.encode(
        JSON.stringify({
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
        })
      )
    );

    res.status(201).json({ message: "User has been created", user });
  } catch (error) {
    res.status(500).json({ message: "Error while creating the user" });
  }
};

/**
 * @description Update a user
 * @route PUT /api/users/:id
 * @access Self and Admin
 */
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      if (req.user.id !== req.params.id) {
        res.status(403).json({
          message: "Forbidden action: admin only",
        });
        return;
      }
    }

    const id = req.params.id;
    const { firstname, lastname, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      data: { firstname, lastname, email, password: hashedPassword, role },
      where: { id },
    });

    const nats = await getNatsConnection();
    nats.publish(
      "user.updated",
      stringCodec.encode(
        JSON.stringify({
          id: user.id,
          email: user.email,
          password: user.password,
          role: user.role,
        })
      )
    );

    res.json({ user: user, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: "Error while updating the user" });
  }
};

/**
 * @description Get all users
 * @route GET /api/users
 * @access Admin
 */
export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res.status(403).json({ message: "Forbidden action: admin only." });
      return;
    }

    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error while getting the users" });
  }
};

/**
 * @description Get a user
 * @route GET /api/users/:id
 * @access Self and Admin
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      if (req.user.id !== req.params.id) {
        res.status(403).json({ message: "Forbidden action: admin only." });
      }
      return;
    }

    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error while getting the user" });
  }
};

/**
 * @description Delete a user
 * @route DELETE /api/users/:id
 * @access Self and Admin
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      if (req.user.id !== req.params.id) {
        res.status(403).json({ message: "Forbidden action: admin only" });
        return;
      }
    }

    const { id } = req.params;
    await prisma.user.delete({ where: { id } });

    const nats = await getNatsConnection();
    nats.publish(
      "user.deleted",
      stringCodec.encode(JSON.stringify({ id: id }))
    );

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error while deleting the user" });
  }
};
