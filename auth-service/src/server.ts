import app from "./app";
import dotenv from "dotenv";
import {
  listenForUserCreated,
  listenForUserDeleted,
  listenForUserUpdated,
} from "./events/listeners/userListener";

dotenv.config();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

listenForUserCreated();
listenForUserUpdated();
listenForUserDeleted();
