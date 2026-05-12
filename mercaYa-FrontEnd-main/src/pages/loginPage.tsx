import { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ← Ya NO hay useEffect ni useNavigate aquí
  // PublicRoute redirige automáticamente si ya está autenticado

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // Cuando login actualiza isAuthenticated → PublicRoute redirige solo
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-xl shadow-lg shadow-sky-200 dark:shadow-sky-900">
            🛍️
          </div>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Merka
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white mb-1 tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            Ingresa tus credenciales para continuar
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span className="flex-1">{error}</span>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@merka.com"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-sky-200 dark:shadow-sky-900 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          MercaYA © 2026 — Merka Plásticos SAS
        </p>
      </div>
    </div>
  );
}
