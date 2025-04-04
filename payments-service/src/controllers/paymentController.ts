import { Request, Response } from "express";
import { getNatsConnection, stringCodec } from "../events/natsClient";

export const processPayment = async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400).json({ message: "Booking ID is required" });
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nats = await getNatsConnection();
    const eventData = { bookingId };

    await nats.publish(
      "payment.completed",
      stringCodec.encode(JSON.stringify(eventData))
    );

    console.log("Payment processed and event sent:", eventData);
    res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
