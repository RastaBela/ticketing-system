import app from "./app";
import dotenv from "dotenv";
import { listenForPaymentRequested } from "./events/listeners/paymentListener";

dotenv.config();

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`💳 Payments service listening on http://localhost:${PORT}`);
});

listenForPaymentRequested();
