import { getNatsConnection, stringCodec } from "../natsClient";

export const listenForPaymentRequested = async () => {
  const nats = await getNatsConnection();
  const sub = nats.subscribe("payment.requested");

  console.log("👂 Listening to payment.requested...");

  for await (const msg of sub) {
    const data = JSON.parse(stringCodec.decode(msg.data));
    console.log("💳 Processing payment for booking:", data.bookingId);

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate a successful payment
    const result = {
      bookingId: data.bookingId,
      userId: data.userId,
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
    };

    // Publish payment.completed
    nats.publish(
      "payment.completed",
      stringCodec.encode(JSON.stringify(result))
    );

    console.log("✅ Payment completed for booking:", data.bookingId);
  }
};
