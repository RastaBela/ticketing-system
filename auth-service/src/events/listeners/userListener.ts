import { getNatsConnection, stringCodec } from "../natsClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listenForUserCreated = async () => {
  const nats = await getNatsConnection();
  const sub = nats.subscribe("user.created");

  console.log("👂 Listening to user.created...");

  for await (const msg of sub) {
    const data = JSON.parse(stringCodec.decode(msg.data));
    console.log("📥 Received user.created:", data);

    await prisma.authUser.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }
};

export const listenForUserUpdated = async () => {
  const nats = await getNatsConnection();
  const sub = nats.subscribe("user.updated");

  console.log("👂 Listening to user.updated...");

  for await (const msg of sub) {
    const data = JSON.parse(stringCodec.decode(msg.data));
    console.log("📥 Received user.updated:", data);

    await prisma.authUser
      .update({
        where: { id: data.id },
        data: {
          email: data.email,
          password: data.password,
          role: data.role,
        },
      })
      .catch((err) => {
        console.warn(`User ${data.id} not found for update.`);
      });
  }
};

export const listenForUserDeleted = async () => {
  const nats = await getNatsConnection();
  const sub = nats.subscribe("user.deleted");

  console.log("👂 Listening to user.deleted...");

  for await (const msg of sub) {
    const { id } = JSON.parse(stringCodec.decode(msg.data));
    console.log("🗑️ Deleting user from auth db:", id);

    await prisma.authUser.delete({ where: { id } }).catch(() => {
      console.warn(`User with ID ${id} already deleted or not found.`);
    });
  }
};
