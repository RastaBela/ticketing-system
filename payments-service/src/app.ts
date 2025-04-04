import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes";
import { setupSwagger } from "./swagger";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api/payments", paymentRoutes);

export default app;
