import { getJetStreamConsumer, stringCodec } from "../natsClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listenForUserCreated = async () => {
  const consumer = await getJetStreamConsumer(
    "USERS",
    "user.created",
    "auth-user-created"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to user.created (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));
      console.log("📥 Received user.created:", data);

      await prisma.authUser.upsert({
        where: { id: data.id },
        update: data,
        create: data,
      });

      msg.ack();
    }
  })();
};

export const listenForUserUpdated = async () => {
  const consumer = await getJetStreamConsumer(
    "USERS",
    "user.updated",
    "auth-user-updated"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to user.updated (JetStream)");

  (async () => {
    for await (const msg of messages) {
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
        .catch(() => {
          console.warn(`User ${data.id} not found for update.`);
        });

      msg.ack();
    }
  })();
};

export const listenForUserDeleted = async () => {
  const consumer = await getJetStreamConsumer(
    "USERS",
    "user.deleted",
    "auth-user-deleted"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to user.deleted (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const { id } = JSON.parse(stringCodec.decode(msg.data));
      console.log("🗑️ Deleting user from auth db:", id);

      await prisma.authUser.delete({ where: { id } }).catch(() => {
        console.warn(`User with ID ${id} already deleted or not found.`);
      });

      msg.ack();
    }
  })();
};
