import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ← envía la cookie HttpOnly automáticamente
});

// Ya NO necesitamos leer el token de localStorage
// La cookie merka_token se envía sola con withCredentials: true

// Si el token expiró, redirige al login (solo una vez, sin loop)
let redirigiendo = false;
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !redirigiendo) {
      redirigiendo = true;
      // Limpia cualquier resto del sistema anterior
      localStorage.removeItem("merka_token");
      localStorage.removeItem("merka_auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
