import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";
import Input from "../components/common/input";
import api from "../lib/api";

export default function PerfilPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user, logout } = useAuthStore();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConf, setPassConf] = useState("");

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [msgInfo, setMsgInfo] = useState("");
  const [msgPass, setMsgPass] = useState("");
  const [errPass, setErrPass] = useState("");

  const initials = nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await api.put(`/usuarios/${user?.id}`, {
        nombre,
        email,
        rol: user?.rol,
        estado: "activo",
      });
      setMsgInfo("✅ Información actualizada");
      setTimeout(() => setMsgInfo(""), 3000);
    } catch {
      setMsgInfo("❌ Error al guardar");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrPass("");
    if (passNueva !== passConf) {
      setErrPass("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passNueva.length < 6) {
      setErrPass("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSavingPass(true);
    try {
      await api.put(`/usuarios/${user?.id}/password`, {
        passwordActual: passActual,
        passwordNueva: passNueva,
      });
      setMsgPass("✅ Contraseña actualizada");
      setPassActual("");
      setPassNueva("");
      setPassConf("");
      setTimeout(() => setMsgPass(""), 3000);
    } catch (err: any) {
      setErrPass(err.response?.data?.message || "Error al cambiar contraseña");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Mi Perfil" onMenuClick={onMenuClick} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg shadow-sky-200 dark:shadow-sky-900/50">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {nombre}
            </h2>
            <p className="text-sky-100 text-sm mt-1 capitalize">
              {user?.rol || "Administrador"}
            </p>
            <p className="text-sky-200 text-xs mt-1">{email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {[
                "Ventas",
                "Compras",
                "Inventario",
                "Clientes",
                "Cartera",
                "Configuración",
              ].map((m) => (
                <span
                  key={m}
                  className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Info personal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              👤 Información personal
            </h3>
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <Input
                label="Nombre completo"
                value={nombre}
                onChange={setNombre}
                required
              />
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Rol
                </label>
                <input
                  value={user?.rol || "admin"}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-400 capitalize cursor-not-allowed"
                />
              </div>

              {msgInfo && (
                <p
                  className={`text-sm font-medium ${msgInfo.startsWith("✅") ? "text-green-600" : "text-red-500"}`}
                >
                  {msgInfo}
                </p>
              )}

              <Button
                type="submit"
                disabled={savingInfo}
                className="w-full justify-center"
              >
                {savingInfo ? "Guardando..." : "💾 Guardar cambios"}
              </Button>
            </form>
          </div>

          <div className="space-y-5">
            {/* Cambiar contraseña */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                🔒 Cambiar contraseña
              </h3>
              <form onSubmit={handleChangePass} className="space-y-4">
                {[
                  {
                    label: "Contraseña actual",
                    value: passActual,
                    set: setPassActual,
                  },
                  {
                    label: "Nueva contraseña",
                    value: passNueva,
                    set: setPassNueva,
                  },
                  {
                    label: "Confirmar nueva contraseña",
                    value: passConf,
                    set: setPassConf,
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type="password"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 transition placeholder:text-slate-300"
                    />
                  </div>
                ))}

                {errPass && (
                  <p className="text-sm font-medium text-red-500">
                    ⚠️ {errPass}
                  </p>
                )}
                {msgPass && (
                  <p className="text-sm font-medium text-green-600">
                    {msgPass}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="ghost"
                  disabled={savingPass}
                  className="w-full justify-center"
                >
                  {savingPass ? "Actualizando..." : "🔑 Actualizar contraseña"}
                </Button>
              </form>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                📊 Información de sesión
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Rol",
                    value: user?.rol || "admin",
                    color: "text-sky-500",
                  },
                  { label: "Estado", value: "Activo", color: "text-green-500" },
                  {
                    label: "Último acceso",
                    value: "Hoy",
                    color: "text-violet-500",
                  },
                  { label: "Sesión", value: "Activa", color: "text-green-500" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 text-center"
                  >
                    <p
                      className={`text-base font-extrabold capitalize ${s.color}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={logout}
                className="mt-4 w-full py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition border border-red-200 dark:border-red-900"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
