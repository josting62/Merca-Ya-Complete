import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { useClientesStore } from "../store/clientesStore";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";
import Spinner from "../components/common/spinner";
import ErrorMessage from "../components/common/errorMessage";
import Modal from "../components/common/modal";
import ClienteForm from "../components/clientes/clienteForm";
import { formatCOP } from "../utils/formatters";
import type { Cliente } from "../types";

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

const TIPO_STYLES: Record<string, { bg: string; color: string }> = {
  Mayorista: { bg: "var(--brand-subtle)", color: "var(--brand)" },
  Minorista: { bg: "var(--surface-3)", color: "var(--text-secondary)" },
  Nuevo: { bg: "#dcfce7", color: "#15803d" },
  VIP: { bg: "#f3e8ff", color: "#7c3aed" },
};

export default function ClientesPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { items, loading, error, fetchAll, create, update, remove } =
    useClientesStore();

  const [search, setSearch] = useState("");
  const [fTipo, setFTipo] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [detalle, setDetalle] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = items.filter((c) => {
    if (
      search &&
      !c.nombre.toLowerCase().includes(search.toLowerCase()) &&
      !c.tel?.includes(search) &&
      !c.doc?.includes(search)
    )
      return false;
    if (fTipo && c.tipo !== fTipo) return false;
    if (fEstado && c.estado !== fEstado) return false;
    return true;
  });

  const totalDeuda = items.reduce((s, c) => s + (c.deuda || 0), 0);
  const activos = items.filter((c) => c.estado === "activo").length;
  const vip = items.filter((c) => c.tipo === "VIP").length;

  const handleSave = async (data: Omit<Cliente, "id">) => {
    setSaving(true);
    try {
      if (editing) await update(editing.id, data);
      else await create(data);
      setModalForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    await remove(id);
    setDetalle(null);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Clientes" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Clientes" onMenuClick={onMenuClick} />
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Clientes"
        onMenuClick={onMenuClick}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setModalForm(true);
            }}
          >
            <FiPlus size={14} /> Nuevo cliente
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total clientes",
              value: items.length,
              color: "var(--text-primary)",
            },
            { label: "Activos", value: activos, color: "#16a34a" },
            {
              label: "Deuda total",
              value: formatCOP(totalDeuda),
              color: "#dc2626",
            },
            { label: "VIP", value: vip, color: "#7c3aed" },
          ].map((k) => (
            <div key={k.label} style={cardStyle} className="p-4">
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </p>
              <p
                className="text-xl font-extrabold tracking-tight"
                style={{ color: k.color }}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div
          style={{ ...cardStyle, padding: "12px" }}
          className="flex flex-wrap gap-2"
        >
          <div className="relative flex-1 min-w-44">
            <FiSearch
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o documento..."
              style={{ ...inputStyle, paddingLeft: "32px" }}
            />
          </div>
          <select
            value={fTipo}
            onChange={(e) => setFTipo(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          >
            <option value="">Tipo: Todos</option>
            {["Mayorista", "Minorista", "Nuevo", "VIP"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={fEstado}
            onChange={(e) => setFEstado(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          >
            <option value="">Estado: Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <button
            onClick={() => {
              setSearch("");
              setFTipo("");
              setFEstado("");
            }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <FiX size={12} /> Limpiar
          </button>
        </div>

        {/* Tabla */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h3
                className="font-bold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Directorio de Clientes
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Cliente",
                    "Contacto",
                    "Ciudad",
                    "Tipo",
                    "Crédito",
                    "Deuda",
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No hay clientes que coincidan
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const ts = TIPO_STYLES[c.tipo] || {
                      bg: "var(--surface-3)",
                      color: "var(--text-muted)",
                    };
                    return (
                      <tr
                        key={c.id}
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
                              {c.nombre.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {c.nombre}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {c.doc || "Sin documento"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {c.tel || "—"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {c.email || "—"}
                          </p>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {c.ciudad || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: ts.bg, color: ts.color }}
                          >
                            {c.tipo}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {c.credito > 0 ? formatCOP(c.credito) : "Sin crédito"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-sm font-bold flex items-center gap-1"
                            style={{
                              color: c.deuda > 0 ? "#dc2626" : "#16a34a",
                            }}
                          >
                            {c.deuda > 0 ? (
                              formatCOP(c.deuda)
                            ) : (
                              <>
                                <FiCheck size={12} /> Al día
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {[
                              {
                                icon: FiEye,
                                action: () => setDetalle(c),
                                bg: "var(--surface-3)",
                                color: "var(--text-muted)",
                                hBg: "var(--brand-subtle)",
                                hColor: "var(--brand)",
                              },
                              {
                                icon: FiEdit2,
                                action: () => {
                                  setEditing(c);
                                  setModalForm(true);
                                },
                                bg: "var(--surface-3)",
                                color: "var(--text-muted)",
                                hBg: "#fef9c3",
                                hColor: "#a16207",
                              },
                              {
                                icon: FiTrash2,
                                action: () => handleDelete(c.id),
                                bg: "#fee2e2",
                                color: "#dc2626",
                                hBg: "#fecaca",
                                hColor: "#dc2626",
                              },
                            ].map(
                              (
                                { icon: Icon, action, bg, color, hBg, hColor },
                                i,
                              ) => (
                                <button
                                  key={i}
                                  onClick={action}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                  style={{ backgroundColor: bg, color }}
                                  onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.backgroundColor = hBg;
                                    el.style.color = hColor;
                                  }}
                                  onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.backgroundColor = bg;
                                    el.style.color = color;
                                  }}
                                >
                                  <Icon size={13} />
                                </button>
                              ),
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

      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? "Editar Cliente" : "Nuevo Cliente"}
        subtitle={
          editing
            ? `Editando: ${editing.nombre}`
            : "Completa los datos del cliente"
        }
        size="md"
      >
        <ClienteForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>

      {detalle && (
        <Modal
          open={!!detalle}
          onClose={() => setDetalle(null)}
          title={detalle.nombre}
          subtitle={`${detalle.tipo} · ${detalle.ciudad || "Sin ciudad"}`}
          size="sm"
          footer={
            <>
              <button
                onClick={() => handleDelete(detalle.id)}
                className="px-4 py-2 text-sm font-bold rounded-xl"
                style={{ color: "#dc2626" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "#fee2e2")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent")
                }
              >
                Eliminar
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setDetalle(null)}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setEditing(detalle);
                    setDetalle(null);
                    setModalForm(true);
                  }}
                >
                  Editar
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-4">
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
                }}
              >
                {detalle.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {detalle.nombre}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {detalle.doc || "Sin documento"}
                </p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold mt-1"
                  style={{
                    backgroundColor: TIPO_STYLES[detalle.tipo]?.bg,
                    color: TIPO_STYLES[detalle.tipo]?.color,
                  }}
                >
                  {detalle.tipo}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Teléfono", detalle.tel || "—"],
                ["Email", detalle.email || "—"],
                ["Ciudad", detalle.ciudad || "—"],
                ["Dirección", detalle.dir || "—"],
                [
                  "Crédito",
                  detalle.credito > 0
                    ? formatCOP(detalle.credito)
                    : "Sin crédito",
                ],
                ["Días", detalle.dias > 0 ? `${detalle.dias} días` : "Contado"],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {k}
                  </p>
                  <p
                    className="font-medium text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: detalle.deuda > 0 ? "#fee2e2" : "#dcfce7",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Deuda actual
              </p>
              <p
                className="text-2xl font-extrabold"
                style={{ color: detalle.deuda > 0 ? "#dc2626" : "#16a34a" }}
              >
                {detalle.deuda > 0 ? formatCOP(detalle.deuda) : "✓ Al día"}
              </p>
            </div>
            {detalle.notas && (
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Notas
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {detalle.notas}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
