import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

import { testConnection } from "./config/db";
import { errorHandler } from "./middleware/error.middleware";

import authRoutes       from "./routes/auth.routes";
import ventasRoutes     from "./routes/ventas.routes";
import comprasRoutes    from "./routes/compras.routes";
import inventarioRoutes from "./routes/inventario.routes";
import clientesRoutes   from "./routes/clientes.routes";
import carteraRoutes    from "./routes/cartera.routes";
import usuariosRoutes   from "./routes/usuarios.routes";
import dashboardRoutes  from "./routes/dashboard.routes";
import despachoRoutes   from "./routes/despacho.routes";

const app        = express();
const httpServer = createServer(app);  // ← HTTP server que comparte Express y Socket.io

// ── Socket.io ──
export const io = new Server(httpServer, {
  cors: {
    origin:      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ── Middleware ──
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Rutas ──
app.use("/api/auth",       authRoutes);
app.use("/api/ventas",     ventasRoutes);
app.use("/api/compras",    comprasRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/clientes",   clientesRoutes);
app.use("/api/cartera",    carteraRoutes);
app.use("/api/usuarios",   usuariosRoutes);
app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/despachos",  despachoRoutes);

app.get("/", (_req, res) =>
  res.json({ message: "MercaYA API", version: "1.0.0" })
);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {   // ← httpServer en lugar de app
  await testConnection();
  console.log(`🚀 MercaYA API corriendo en http://localhost:${PORT}`);
  console.log(`🔌 Socket.io activo`);
});