import app from "./app";
import {
  listenForEventCreated,
  listenForEventDeleted,
  listenForEventUpdated,
} from "./events/listeners/eventListener";
import { listenForPaymentCompleted } from "./events/listeners/paymentListener";

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`✅ Bookings service listening on http://localhost:${PORT}`);
});

listenForEventCreated();
listenForEventUpdated();
listenForEventDeleted();
listenForPaymentCompleted();
