import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ["https://localhost:5173",
  "https://127.0.0.1:5173",
  "https://10.12.18.2:5173"],
  credentials: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});