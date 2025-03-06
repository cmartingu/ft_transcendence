import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use("/auth", authRoutes); // 📌 Agregamos las rutas de autenticación

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
