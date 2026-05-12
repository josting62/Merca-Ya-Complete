import { useEffect, useState } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { useUsuariosStore } from "../store/usuariosStore";
import { usePermissions } from "../hooks/usePermissions";
import Topbar from "../components/layout/topBar";
import Spinner from "../components/common/spinner";
import Modal from "../components/common/modal";
import Button from "../components/common/button";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "10px",
  fontSize: "13px",
  padding: "8px 12px",
  outline: "none",
  width: "100%",
};

// FIX: se agrega cajera al mapa de estilos
const ROL_STYLES: Record<string, { bg: string; color: string }> = {
  admin: { bg: "var(--brand-subtle)", color: "var(--brand)" },
  vendedor: { bg: "#dcfce7", color: "#15803d" },
  bodega: { bg: "#fef9c3", color: "#a16207" },
  cajera: { bg: "#f3e8ff", color: "#7c3aed" },
};

const ESTADO_STYLES: Record<string, { bg: string; color: string }> = {
  activo: { bg: "#dcfce7", color: "#15803d" },
  inactivo: { bg: "#fee2e2", color: "#dc2626" },
};

interface FormData {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  pin: string;
}

const emptyForm = (): FormData => ({
  nombre: "",
  email: "",
  password: "",
  rol: "vendedor",
  pin: "",
});

export default function UsuariosPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const perms = usePermissions();

  if (!perms.gestionarUsuarios) return <Navigate to="/dashboard" replace />;

  const {
    items,
    loading,
    fetchAll,
    create,
    update,
    remove,
    changePin,
    generarPin,
  } = useUsuariosStore();

  const [modalForm, setModalForm] = useState(false);
  const [modalPin, setModalPin] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [pinTarget, setPinTarget] = useState<any>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [nuevoPin, setNuevoPin] = useState("");
  const [pinCopiado, setPinCopiado] = useState(false);
  const [pinGenerado, setPinGenerado] = useState<{
    usuario: string;
    pin: string;
  } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const activos = items.filter(
    (u) => u.estado?.toLowerCase() === "activo",
  ).length;
  const vendedores = items.filter((u) => u.rol === "vendedor").length;
  const bodegas = items.filter((u) => u.rol === "bodega").length;

  const setF = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleGenerarPin = async () => {
    const pin = await generarPin();
    setF("pin", pin);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.email) return;
    if (!editTarget && (!form.password || !form.pin)) return;
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          estado: editTarget.estado,
        });
      } else {
        const { pin } = await create(form);
        setPinGenerado({ usuario: form.nombre, pin });
      }
      setModalForm(false);
      setEditTarget(null);
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarPin = async () => {
    if (!nuevoPin || nuevoPin.length !== 6 || !pinTarget) return;
    setSaving(true);
    try {
      await changePin(pinTarget.id, nuevoPin);
      setPinGenerado({ usuario: pinTarget.nombre, pin: nuevoPin });
      setModalPin(false);
      setPinTarget(null);
      setNuevoPin("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`Desactivar al usuario "${nombre}"?`)) return;
    await remove(id);
  };

  const copiarPin = async (pin: string) => {
    await navigator.clipboard.writeText(pin);
    setPinCopiado(true);
    setTimeout(() => setPinCopiado(false), 2000);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Usuarios" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Usuarios"
        onMenuClick={onMenuClick}
        actions={
          <Button
            onClick={() => {
              setEditTarget(null);
              setForm(emptyForm());
              setModalForm(true);
            }}
          >
            <FiPlus size={14} /> Nuevo usuario
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: items.length,
              color: "var(--text-primary)",
            },
            { label: "Activos", value: activos, color: "#16a34a" },
            { label: "Vendedores", value: vendedores, color: "var(--brand)" },
            { label: "Bodega", value: bodegas, color: "#a16207" },
          ].map((k) => (
            <div key={k.label} style={cardStyle} className="p-4">
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </p>
              <p className="text-xl font-extrabold" style={{ color: k.color }}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div
            className="px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Equipo de trabajo
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {items.length} usuario{items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Usuario",
                    "Email",
                    "Rol",
                    "Estado",
                    "Registrado",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-left whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--surface-2)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  items.map((u) => {
                    // FIX: case-insensitive para comparar estado y rol
                    const rolKey = u.rol?.toLowerCase() || "vendedor";
                    const estadoKey = u.estado?.toLowerCase() || "activo";
                    const rs = ROL_STYLES[rolKey] || ROL_STYLES.vendedor;
                    const es = ESTADO_STYLES[estadoKey] || ESTADO_STYLES.activo;
                    const estaActivo = estadoKey === "activo";

                    return (
                      <tr
                        key={u.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--surface-2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "")
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
                              }}
                            >
                              {u.nombre.slice(0, 2).toUpperCase()}
                            </div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {u.nombre}
                            </p>
                          </div>
                        </td>

                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {u.email}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: rs.bg, color: rs.color }}
                          >
                            {rolKey === "admin" && <FiShield size={9} />}
                            {rolKey.charAt(0).toUpperCase() + rolKey.slice(1)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: es.bg, color: es.color }}
                          >
                            {estadoKey.charAt(0).toUpperCase() +
                              estadoKey.slice(1)}
                          </span>
                        </td>

                        <td
                          className="px-4 py-3 text-xs whitespace-nowrap"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {new Date(u.created_at).toLocaleDateString("es-CO")}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Editar */}
                            <button
                              onClick={() => {
                                setEditTarget(u);
                                setForm({
                                  nombre: u.nombre,
                                  email: u.email,
                                  password: "",
                                  rol: u.rol,
                                  pin: "",
                                });
                                setModalForm(true);
                              }}
                              title="Editar usuario"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{
                                backgroundColor: "var(--surface-3)",
                                color: "var(--text-muted)",
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.backgroundColor =
                                  "var(--brand-subtle)";
                                el.style.color = "var(--brand)";
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.backgroundColor = "var(--surface-3)";
                                el.style.color = "var(--text-muted)";
                              }}
                            >
                              <FiEdit2 size={13} />
                            </button>

                            {/* Cambiar PIN */}
                            <button
                              onClick={() => {
                                setPinTarget(u);
                                setNuevoPin("");
                                setModalPin(true);
                              }}
                              title="Cambiar PIN"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{
                                backgroundColor: "var(--brand-subtle)",
                                color: "var(--brand)",
                              }}
                              onMouseEnter={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.opacity = "0.8")
                              }
                              onMouseLeave={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.opacity = "1")
                              }
                            >
                              <FiShield size={13} />
                            </button>

                            {/* FIX: case-insensitive, siempre visible si está activo */}
                            {estaActivo && (
                              <button
                                onClick={() => handleDelete(u.id, u.nombre)}
                                title="Desactivar usuario"
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#dc2626",
                                }}
                                onMouseEnter={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.backgroundColor = "#fecaca")
                                }
                                onMouseLeave={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.backgroundColor = "#fee2e2")
                                }
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditTarget(null);
        }}
        title={editTarget ? "Editar usuario" : "Nuevo usuario"}
        subtitle={
          editTarget
            ? `Editando: ${editTarget.nombre}`
            : "Completa los datos del trabajador"
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setModalForm(false);
                setEditTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Guardando..."
                : editTarget
                  ? "Guardar cambios"
                  : "Crear usuario"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Nombre
            </label>
            <input
              value={form.nombre}
              onChange={(e) => setF("nombre", e.target.value)}
              placeholder="Juan Perez"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setF("email", e.target.value)}
              placeholder="juan@merka.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Rol
            </label>
            <select
              value={form.rol}
              onChange={(e) => setF("rol", e.target.value)}
              style={inputStyle}
            >
              <option value="vendedor">Vendedor</option>
              <option value="bodega">Bodega</option>
              <option value="cajera">Cajera</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!editTarget && (
            <>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Contrasena
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl px-3"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setF("password", e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    className="flex-1 bg-transparent text-sm py-2.5 outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  PIN de autorizacion (6 caracteres)
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 flex items-center gap-2 rounded-xl px-3"
                    style={{
                      backgroundColor: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <input
                      type={showPin ? "text" : "password"}
                      value={form.pin}
                      onChange={(e) =>
                        setF("pin", e.target.value.toUpperCase().slice(0, 6))
                      }
                      placeholder="Ej: AB3X9Z"
                      maxLength={6}
                      className="flex-1 bg-transparent text-sm py-2.5 outline-none font-mono tracking-widest uppercase"
                      style={{ color: "var(--text-primary)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showPin ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={handleGenerarPin}
                    title="Generar PIN aleatorio"
                    className="px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    style={{
                      backgroundColor: "var(--brand-subtle)",
                      color: "var(--brand)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <FiRefreshCw size={12} /> Auto
                  </button>
                </div>
                <p
                  className="text-[10px] mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  El usuario usara este PIN para autorizar acciones criticas.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal cambiar PIN */}
      {pinTarget && (
        <Modal
          open={modalPin}
          onClose={() => {
            setModalPin(false);
            setPinTarget(null);
          }}
          title="Cambiar PIN"
          subtitle={`Cambiando PIN de: ${pinTarget?.nombre}`}
          size="sm"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setModalPin(false);
                  setPinTarget(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCambiarPin}
                disabled={saving || nuevoPin.length !== 6}
              >
                <FiShield size={14} />{" "}
                {saving ? "Guardando..." : "Actualizar PIN"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                Nuevo PIN (6 caracteres)
              </label>
              <div className="flex gap-2">
                <input
                  value={nuevoPin}
                  onChange={(e) =>
                    setNuevoPin(e.target.value.toUpperCase().slice(0, 6))
                  }
                  placeholder="Ej: XK7P2A"
                  maxLength={6}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest uppercase outline-none"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={async () => setNuevoPin(await generarPin())}
                  className="px-3 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  style={{
                    backgroundColor: "var(--brand-subtle)",
                    color: "var(--brand)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <FiRefreshCw size={12} /> Auto
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal PIN generado */}
      {pinGenerado && (
        <Modal
          open={!!pinGenerado}
          onClose={() => setPinGenerado(null)}
          title="PIN generado"
          subtitle={`Anota el PIN de ${pinGenerado.usuario}`}
          size="sm"
          footer={
            <Button onClick={() => setPinGenerado(null)}>Entendido</Button>
          }
        >
          <div className="space-y-4 text-center py-2">
            <div
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl"
              style={{ backgroundColor: "var(--brand-subtle)" }}
            >
              <span
                className="text-3xl font-black tracking-[0.3em] font-mono"
                style={{ color: "var(--brand)" }}
              >
                {pinGenerado.pin}
              </span>
            </div>
            <button
              onClick={() => copiarPin(pinGenerado.pin)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: "var(--surface-3)",
                color: "var(--text-secondary)",
              }}
            >
              {pinCopiado ? (
                <>
                  <FiCheck size={14} /> Copiado
                </>
              ) : (
                <>
                  <FiCopy size={14} /> Copiar PIN
                </>
              )}
            </button>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Comparte este PIN solo con el usuario. No se puede ver de nuevo
              una vez cierres esta ventana.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
