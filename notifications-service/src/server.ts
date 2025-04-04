import app from "./app";
import { listenForBookingCreated } from "../events/listeners/bookingListener";

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`✅ Notifications service ready on port ${PORT}`);
});

listenForBookingCreated();
