import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FiTruck,
  FiEye,
  FiCreditCard,
  FiSearch,
  FiX,
  FiDownload,
  FiPlus,
  FiPackage,
  FiTrash2,
} from "react-icons/fi";
import { useVentasStore } from "../store/ventasStore";
import { useClientesStore } from "../store/clientesStore";
import { useDespachoStore } from "../store/despachoStore";
import { usePermissions } from "../hooks/usePermissions";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";
import Spinner from "../components/common/spinner";
import ErrorMessage from "../components/common/errorMessage";
import Modal from "../components/common/modal";
import PinModal from "../components/common/pinModal";
import VentaForm from "../components/ventas/ventasForm";
import PagoModal from "../components/ventas/pagoModal";
import OrdenModal from "../components/ventas/ordenModal";
import { BadgePago, BadgeEstado } from "../components/common/badge";
import { formatCOP } from "../utils/formatters";
import type { Venta } from "../types";

const PAGE_SIZE = 10;
const NEGOCIO_LAT = 7.8939;
const NEGOCIO_LNG = -72.5078;

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

export default function VentasPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const perms = usePermissions();

  const {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    registrarPago,
  } = useVentasStore();
  const { items: clientes, fetchAll: fetchClientes } = useClientesStore();
  const {
    items: despachos,
    fetchAll: fetchDespachos,
    create: crearDespacho,
  } = useDespachoStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPago, setFPago] = useState("");
  const [fMetodo, setFMetodo] = useState("");

  const [modalForm, setModalForm] = useState(false);
  const [editing, setEditing] = useState<Venta | null>(null);
  const [detalle, setDetalle] = useState<Venta | null>(null);
  const [pagoTarget, setPagoTarget] = useState<Venta | null>(null);
  const [saving, setSaving] = useState(false);

  const [despachoModal, setDespachoModal] = useState<{
    venta: Venta;
    despacho: any;
  } | null>(null);
  const [creandoDespacho, setCreandoDespacho] = useState<string | null>(null);
  const [pinVentaId, setPinVentaId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    fetchClientes();
    fetchDespachos();
  }, []);

  // ── Filtros ──
  const filtered = items.filter((v) => {
    if (search && !v.cliente.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (fEstado && v.estado !== fEstado) return false;
    if (fPago === "pendientes") {
      if (v.estadoPago === "pagado") return false;
    } else if (fPago && v.estadoPago !== fPago) return false;
    if (fMetodo && v.metodo !== fMetodo) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  const totalMes = items.reduce((s, v) => s + Number(v.total), 0);
  const pagadas = items.filter((v) => v.estadoPago === "pagado").length;
  const noPagadas = items.filter((v) => v.estadoPago !== "pagado").length;

  // ── Exportar CSV ──
  const handleExportar = () => {
    const encabezados = [
      "N°",
      "Cliente",
      "Método",
      "Total",
      "Estado Entrega",
      "Estado Pago",
      "Productos",
      "Notas",
    ];
    const filas = filtered.map((v) => [
      v.id,
      v.cliente,
      v.metodo,
      Number(v.total),
      v.estado,
      v.estadoPago,
      v.prods?.map((p) => `${p.n} x${p.q}`).join(" | ") || "",
      v.notas || "",
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) =>
        fila.map((cel) => `"${String(cel).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    // BOM para que Excel abra bien los caracteres en español
    const bom = "\uFEFF";
    const blob = new Blob([bom + contenido], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Handlers ──
  const handleSave = async (data: Omit<Venta, "id">) => {
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
    if (!confirm("¿Eliminar esta venta? Esta acción no se puede deshacer."))
      return;
    await remove(id);
    setDetalle(null);
  };

  const handleEliminarConPermiso = (id: string) => {
    if (perms.eliminarVenta) {
      handleDelete(id);
    } else {
      setDetalle(null);
      setPinVentaId(id);
    }
  };

  const handlePago = async (monto: number, metodo: string) => {
    if (!pagoTarget) return;
    await registrarPago(pagoTarget.id, monto, metodo);
    setPagoTarget(null);
  };

  const handleCrearDespacho = async (v: Venta) => {
    setCreandoDespacho(v.id);
    try {
      const cliente = clientes.find(
        (c) => c.nombre === v.cliente || c.id === v.cliente,
      );
      const { codigo } = await crearDespacho({
        venta_id: v.id,
        cliente_nombre: v.cliente,
        cliente_doc: cliente?.doc || "",
        cliente_tel: cliente?.tel || "",
        cliente_email: cliente?.email || "",
        direccion: cliente?.dir || "Sin dirección",
        ciudad: cliente?.ciudad || "Sin ciudad",
        notas: v.notas,
        origen_lat: NEGOCIO_LAT,
        origen_lng: NEGOCIO_LNG,
      });
      await fetchDespachos();
      const nuevo = useDespachoStore
        .getState()
        .items.find((d) => d.codigo === codigo);
      if (nuevo) setDespachoModal({ venta: v, despacho: nuevo });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al crear el despacho");
    } finally {
      setCreandoDespacho(null);
    }
  };

  const handleVerDespacho = (v: Venta) => {
    const d = despachos.find((d) => d.venta_id === v.id);
    if (d) setDespachoModal({ venta: v, despacho: d });
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Ventas" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Ventas" onMenuClick={onMenuClick} />
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Ventas"
        onMenuClick={onMenuClick}
        actions={
          perms.crearVenta ? (
            <Button
              onClick={() => {
                setEditing(null);
                setModalForm(true);
              }}
            >
              <FiPlus size={14} /> Nueva venta
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total del mes",
              value: formatCOP(totalMes),
              color: "var(--brand)",
            },
            { label: "Cobradas", value: pagadas, color: "#16a34a" },
            { label: "Por cobrar", value: noPagadas, color: "#dc2626" },
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
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Buscar cliente..."
              style={{ ...inputStyle, paddingLeft: "32px" }}
            />
          </div>
          {[
            {
              id: "fe",
              val: fEstado,
              set: (v: string) => {
                setFEstado(v);
                resetPage();
              },
              ph: "Entrega: Todos",
              opts: [
                { value: "completado", label: "Completado" },
                { value: "transito", label: "En tránsito" },
                { value: "pendiente", label: "Pendiente" },
                { value: "cancelado", label: "Cancelado" },
              ],
            },
            {
              id: "fp",
              val: fPago,
              set: (v: string) => {
                setFPago(v);
                resetPage();
              },
              ph: "Pago: Todos",
              opts: [
                { value: "pagado", label: "Pagado" },
                { value: "parcial", label: "Parcial" },
                { value: "no-pagado", label: "No pagado" },
                { value: "pendientes", label: "No pagado + Parcial" },
              ],
            },
            {
              id: "fm",
              val: fMetodo,
              set: (v: string) => {
                setFMetodo(v);
                resetPage();
              },
              ph: "Método: Todos",
              opts: [
                { value: "Efectivo", label: "Efectivo" },
                { value: "Pago Móvil", label: "Pago Móvil" },
                { value: "Transferencia", label: "Transferencia" },
              ],
            },
          ].map((f) => (
            <select
              key={f.id}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              style={{ ...inputStyle, width: "auto" }}
            >
              <option value="">{f.ph}</option>
              {f.opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <button
            onClick={() => {
              setSearch("");
              setFEstado("");
              setFPago("");
              setFMetodo("");
              resetPage();
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
                Registro de Ventas
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            {/* ── BOTÓN EXPORTAR FUNCIONAL ── */}
            <button
              onClick={handleExportar}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface-2)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "var(--brand-subtle)";
                el.style.color = "var(--brand)";
                el.style.borderColor = "var(--brand)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "var(--surface-2)";
                el.style.color = "var(--text-secondary)";
                el.style.borderColor = "var(--border)";
              }}
            >
              <FiDownload size={12} /> Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "N°",
                    "Cliente",
                    "Método",
                    "Total",
                    "Estado entrega",
                    "Estado pago",
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
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No hay ventas que coincidan
                    </td>
                  </tr>
                ) : (
                  paginated.map((v) => {
                    const tieneDespacho = despachos.some(
                      (d) => d.venta_id === v.id,
                    );
                    return (
                      <tr
                        key={v.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--surface-2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "")
                        }
                      >
                        <td
                          className="px-4 py-3 text-xs font-bold"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {v.id}
                        </td>

                        <td className="px-4 py-3">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {v.cliente}
                          </p>
                          <p
                            className="text-xs flex items-center gap-1 mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <FiPackage size={10} /> {v.prods?.length || 0}{" "}
                            producto{v.prods?.length !== 1 ? "s" : ""}
                          </p>
                        </td>

                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {v.metodo}
                        </td>

                        <td
                          className="px-4 py-3 text-sm font-extrabold whitespace-nowrap"
                          style={{ color: "var(--brand)" }}
                        >
                          {formatCOP(v.total)}
                        </td>

                        <td className="px-4 py-3">
                          <BadgeEstado estado={v.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <BadgePago estado={v.estadoPago} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Ver */}
                            <button
                              onClick={() => setDetalle(v)}
                              title="Ver detalles"
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
                              <FiEye size={13} />
                            </button>

                            {/* Pago */}
                            {v.estadoPago !== "pagado" &&
                              v.estado !== "cancelado" && (
                                <button
                                  onClick={() => setPagoTarget(v)}
                                  title="Registrar pago"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                  style={{
                                    backgroundColor: "#dcfce7",
                                    color: "#16a34a",
                                  }}
                                  onMouseEnter={(e) =>
                                    ((
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor = "#bbf7d0")
                                  }
                                  onMouseLeave={(e) =>
                                    ((
                                      e.currentTarget as HTMLElement
                                    ).style.backgroundColor = "#dcfce7")
                                  }
                                >
                                  <FiCreditCard size={13} />
                                </button>
                              )}

                            {/* Despacho */}
                            {perms.crearDespacho &&
                              v.estado !== "cancelado" && (
                                <button
                                  onClick={() =>
                                    tieneDespacho
                                      ? handleVerDespacho(v)
                                      : handleCrearDespacho(v)
                                  }
                                  disabled={creandoDespacho === v.id}
                                  title={
                                    tieneDespacho
                                      ? "Ver orden de despacho"
                                      : "Crear despacho"
                                  }
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                  style={
                                    tieneDespacho
                                      ? {
                                          backgroundColor:
                                            "var(--brand-subtle)",
                                          color: "var(--brand)",
                                        }
                                      : {
                                          backgroundColor: "var(--surface-3)",
                                          color: "var(--text-muted)",
                                        }
                                  }
                                  onMouseEnter={(e) => {
                                    if (!tieneDespacho) {
                                      const el = e.currentTarget as HTMLElement;
                                      el.style.backgroundColor = "#fef9c3";
                                      el.style.color = "#a16207";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!tieneDespacho) {
                                      const el = e.currentTarget as HTMLElement;
                                      el.style.backgroundColor =
                                        "var(--surface-3)";
                                      el.style.color = "var(--text-muted)";
                                    }
                                  }}
                                >
                                  {creandoDespacho === v.id ? (
                                    <span className="text-[9px]">⏳</span>
                                  ) : (
                                    <FiTruck size={13} />
                                  )}
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg text-sm font-bold disabled:opacity-30"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className="w-8 h-8 rounded-lg text-sm font-bold"
                      style={
                        n === page
                          ? { backgroundColor: "var(--brand)", color: "#fff" }
                          : {
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg text-sm font-bold disabled:opacity-30"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal crear/editar ── */}
      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? "Modificar Venta" : "Nueva Venta"}
        subtitle={
          editing ? `Editando: ${editing.id}` : "Completa los datos de la venta"
        }
        size="lg"
      >
        <VentaForm
          initial={editing || undefined}
          clientes={clientes.map((c) => ({ id: c.id, nombre: c.nombre }))}
          onSave={handleSave}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>

      {/* ── Modal detalle ── */}
      {detalle && (
        <Modal
          open={!!detalle}
          onClose={() => setDetalle(null)}
          title={`Venta ${detalle.id}`}
          subtitle={`Cliente: ${detalle.cliente}`}
          size="sm"
          footer={
            <>
              <button
                onClick={() => handleEliminarConPermiso(detalle.id)}
                className="px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-1.5"
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
                <FiTrash2 size={13} />
                {perms.eliminarVenta ? "Eliminar" : "Eliminar (PIN)"}
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setDetalle(null)}>
                  Cerrar
                </Button>
                {perms.editarVenta && (
                  <Button
                    onClick={() => {
                      setEditing(detalle);
                      setDetalle(null);
                      setModalForm(true);
                    }}
                  >
                    Modificar
                  </Button>
                )}
              </div>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div
              className="grid grid-cols-2 gap-3 rounded-xl p-4"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              {[
                ["Cliente", detalle.cliente],
                ["Método", detalle.metodo],
                ["Entrega", detalle.estado],
                ["Pago", detalle.estadoPago],
              ].map(([k, v]) => (
                <div key={k}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {k}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {v}
                  </p>
                </div>
              ))}
              {detalle.notas && (
                <div className="col-span-2">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Observaciones
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {detalle.notas}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
              >
                <FiPackage size={10} /> Productos
              </p>
              {detalle.prods?.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2.5"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.n}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatCOP(p.p)} × {p.q}
                      {p.d ? ` · Desc. ${p.d}%` : ""}
                    </p>
                  </div>
                  <p className="font-bold" style={{ color: "var(--brand)" }}>
                    {formatCOP(p.p * p.q * (1 - p.d / 100))}
                  </p>
                </div>
              ))}
              <div
                className="mt-3 p-3 rounded-xl flex justify-between"
                style={{ backgroundColor: "var(--brand-subtle)" }}
              >
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Total
                </span>
                <span
                  className="text-xl font-extrabold"
                  style={{ color: "var(--brand)" }}
                >
                  {formatCOP(detalle.total)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal pago ── */}
      {pagoTarget && (
        <PagoModal
          open={!!pagoTarget}
          onClose={() => setPagoTarget(null)}
          ventaId={pagoTarget.id}
          clienteNombre={pagoTarget.cliente}
          total={pagoTarget.total}
          estadoPago={pagoTarget.estadoPago}
          onConfirm={handlePago}
        />
      )}

      {/* ── Modal orden despacho ── */}
      {despachoModal && (
        <OrdenModal
          open={!!despachoModal}
          onClose={() => setDespachoModal(null)}
          venta={despachoModal.venta}
          despacho={despachoModal.despacho}
        />
      )}

      {/* ── PIN Modal ── */}
      <PinModal
        open={!!pinVentaId}
        onClose={() => setPinVentaId(null)}
        onSuccess={async () => {
          if (pinVentaId) await handleDelete(pinVentaId);
          setPinVentaId(null);
        }}
        accion="Eliminar venta — requiere autorización de administrador"
      />
    </div>
  );
}
