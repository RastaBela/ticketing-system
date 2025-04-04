import { getJetStreamConsumer, stringCodec } from "../natsClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listenForEventCreated = async () => {
  const consumer = await getJetStreamConsumer(
    "EVENTS",
    "event.created",
    "booking-event-created"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to event.created (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));
      console.log("📥 event.created received:", data);

      await prisma.event.upsert({
        where: { id: data.id },
        update: {
          title: data.title,
          description: data.description,
          price: data.price,
          date: new Date(data.date),
          availableTickets: data.availableTickets,
          organizerId: data.organizerId,
          createdAt: new Date(data.createdAt),
        },
        create: {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          date: new Date(data.date),
          availableTickets: data.availableTickets,
          organizerId: data.organizerId,
          createdAt: new Date(data.createdAt),
        },
      });

      msg.ack();
    }
  })();
};

export const listenForEventUpdated = async () => {
  const consumer = await getJetStreamConsumer(
    "EVENTS",
    "event.updated",
    "booking-event-updated"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to event.updated (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));
      console.log("📥 event.updated received:", data);

      await prisma.event.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          date: new Date(data.date),
          availableTickets: data.availableTickets,
          organizerId: data.organizerId,
        },
      });

      msg.ack();
    }
  })();
};

export const listenForEventDeleted = async () => {
  const consumer = await getJetStreamConsumer(
    "EVENTS",
    "event.deleted",
    "booking-event-deleted"
  );
  const messages = await consumer.consume();

  console.log("👂 Listening to event.deleted (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));
      console.log("📥 event.deleted received:", data);

      await prisma.event.delete({ where: { id: data.id } });

      msg.ack();
    }
  })();
};
