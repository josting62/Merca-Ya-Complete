import { io } from "socket.io-client";

// Conexión singleton al servidor
export const socket = io(
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000",
  {
    withCredentials: true,
    autoConnect:     true,
    reconnection:    true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  }
);

socket.on("connect",    () => console.log("🔌 Socket conectado:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket desconectado"));
socket.on("connect_error", (err) => console.warn("Socket error:", err.message));

export default socket;