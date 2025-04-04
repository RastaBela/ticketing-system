import {
  getJetStreamConsumer,
  getNatsConnection,
  stringCodec,
} from "../natsClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listenForPaymentCompleted = async () => {
  const consumer = await getJetStreamConsumer(
    "PAYMENTS",
    "payment.completed",
    "booking-payment-completed"
  );

  const messages = await consumer.consume();

  console.log("👂 Listening to payment.completed (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));
      const { bookingId } = data;

      console.log("✅ Payment completed for booking:", bookingId);

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      const nats = await getNatsConnection();
      nats.publish(
        "booking.created",
        stringCodec.encode(JSON.stringify(booking))
      );

      console.log("📤 booking.created published:", booking.id);

      msg.ack();
    }
  })();
};
