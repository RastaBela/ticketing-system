import { getJetStreamConsumer, stringCodec } from "../natsClient";
import { sendConfirmationEmail } from "../../src/mailer";

export const listenForBookingCreated = async () => {
  const consumer = await getJetStreamConsumer(
    "BOOKINGS",
    "booking.created",
    "notification-booking-listener"
  );

  const messages = await consumer.consume({});

  console.log("👂 Listening to booking.created (JetStream)");

  (async () => {
    for await (const msg of messages) {
      const data = JSON.parse(stringCodec.decode(msg.data));

      const to = data.email || "test@example.com";
      const html = `
        <h2>Booking Confirmation</h2>
        <p>Thank you for your booking!</p>
        <p>You have successfully reserved <strong>${data.quantity}</strong> ticket(s) for event <strong>${data.title}</strong>.</p>
        <p>Total amount paid: <strong>${data.totalPrice} €</strong></p>
        <br>
        <p>We look forward to seeing you at the event!</p>
        <p>– The Ticketing Team</p>
      `;

      try {
        await sendConfirmationEmail(to, "Your booking is confirmed!", html);
        console.log("✅ Email sent to:", to);
        console.log("➡️ Check the mails at http://localhost:1080");
        msg.ack();
      } catch (err) {
        console.error("❌ Failed to send email:", err);
      }
    }
  })();
};
