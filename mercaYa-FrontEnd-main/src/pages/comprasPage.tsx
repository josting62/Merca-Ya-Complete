import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FiEye,
  FiCreditCard,
  FiSearch,
  FiX,
  FiDownload,
  FiPlus,
  FiPackage,
} from "react-icons/fi";
import { useComprasStore } from "../store/comprasStore";
import Topbar from "../components/layout/topBar";
import Button from "../components/common/button";
import Spinner from "../components/common/spinner";
import ErrorMessage from "../components/common/errorMessage";
import Modal from "../components/common/modal";
import CompraForm from "../components/compras/comprasForm";
import PagoModal from "../components/ventas/pagoModal";
import { BadgePago, BadgeEstado } from "../components/common/badge";
import { formatCOP } from "../utils/formatters";
import type { Compra } from "../types";

const PAGE_SIZE = 10;

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

export default function ComprasPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    registrarPago,
  } = useComprasStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPago, setFPago] = useState("");
  const [fMetodo, setFMetodo] = useState("");
  const [modalForm, setModalForm] = useState(false);
  const [editing, setEditing] = useState<Compra | null>(null);
  const [detalle, setDetalle] = useState<Compra | null>(null);
  const [pagoTarget, setPagoTarget] = useState<Compra | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = items.filter((c) => {
    if (search && !c.empresa.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (fEstado && c.estado !== fEstado) return false;
    if (fPago === "pendientes") {
      if (c.estadoPago === "pagado") return false;
    } else if (fPago && c.estadoPago !== fPago) return false;
    if (fMetodo && c.metodo !== fMetodo) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  const totalGasto = items.reduce((s, c) => s + Number(c.total), 0);
  const pagadas = items.filter((c) => c.estadoPago === "pagado").length;
  const porPagar = items.filter((c) => c.estadoPago !== "pagado").length;

  // Exportar CSV
  const handleExportar = () => {
    const encabezados = [
      "N°",
      "Empresa",
      "Metodo",
      "Cuotas",
      "Total",
      "Estado Entrega",
      "Estado Pago",
      "Notas",
    ];
    const filas = filtered.map((c) => [
      c.id,
      c.empresa,
      c.metodo,
      c.cuotas > 1 ? `${c.cuotas} cuotas` : "Contado",
      Number(c.total),
      c.estado,
      c.estadoPago,
      c.notas || "",
    ]);
    const contenido = [encabezados, ...filas]
      .map((f) =>
        f.map((cel) => `"${String(cel).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + contenido], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compras_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (data: Omit<Compra, "id">) => {
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
    if (!confirm("Eliminar esta compra?")) return;
    await remove(id);
    setDetalle(null);
  };

  const handlePago = async (monto: number, metodo: string) => {
    if (!pagoTarget) return;
    await registrarPago(pagoTarget.id, monto, metodo);
    setPagoTarget(null);
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Compras" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Compras" onMenuClick={onMenuClick} />
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Compras"
        onMenuClick={onMenuClick}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setModalForm(true);
            }}
          >
            <FiPlus size={14} /> Nueva compra
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Gasto total",
              value: formatCOP(totalGasto),
              color: "var(--brand)",
            },
            { label: "Pagadas", value: pagadas, color: "#16a34a" },
            { label: "Por pagar", value: porPagar, color: "#dc2626" },
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
              placeholder="Buscar empresa..."
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
                { value: "transito", label: "En transito" },
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
              ph: "Metodo: Todos",
              opts: [
                { value: "Efectivo", label: "Efectivo" },
                { value: "Pago Movil", label: "Pago Movil" },
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
                Registro de Compras
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
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
                    "Empresa",
                    "Metodo",
                    "Cuotas",
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
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No hay compras que coincidan
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
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
                      <td
                        className="px-4 py-3 text-xs font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {c.id}
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {c.empresa}
                        </p>
                        <p
                          className="text-xs flex items-center gap-1 mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <FiPackage size={10} /> {c.prods?.length || 0}{" "}
                          producto{c.prods?.length !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {c.metodo}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {c.cuotas > 1 ? `${c.cuotas} cuotas` : "Contado"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-extrabold whitespace-nowrap"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(c.total)}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeEstado estado={c.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <BadgePago estado={c.estadoPago} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetalle(c)}
                            title="Ver detalles"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: "var(--surface-3)",
                              color: "var(--text-muted)",
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.backgroundColor = "var(--brand-subtle)";
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
                          {c.estadoPago !== "pagado" &&
                            c.estado !== "cancelado" && (
                              <button
                                onClick={() => setPagoTarget(c)}
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Mostrando {(page - 1) * PAGE_SIZE + 1}-
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

      {/* Modal crear/editar */}
      <Modal
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditing(null);
        }}
        title={editing ? "Modificar Compra" : "Nueva Compra"}
        subtitle={
          editing ? `Editando: ${editing.id}` : "Completa los datos de la orden"
        }
        size="lg"
      >
        <CompraForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => {
            setModalForm(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>

      {/* Modal detalle */}
      {detalle && (
        <Modal
          open={!!detalle}
          onClose={() => setDetalle(null)}
          title={`Compra ${detalle.id}`}
          subtitle={`Proveedor: ${detalle.empresa}`}
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
                  Modificar
                </Button>
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
                ["Empresa", detalle.empresa],
                ["Metodo", detalle.metodo],
                [
                  "Cuotas",
                  detalle.cuotas > 1 ? `${detalle.cuotas} cuotas` : "Contado",
                ],
                ["Entrega", detalle.estado],
                ["Pago", detalle.estadoPago],
              ].map(([k, v]) => (
                <div key={String(k)}>
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
                      {formatCOP(p.p)} x {p.q}
                      {p.d ? ` Desc. ${p.d}%` : ""}
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

      {pagoTarget && (
        <PagoModal
          open={!!pagoTarget}
          onClose={() => setPagoTarget(null)}
          ventaId={pagoTarget.id}
          clienteNombre={pagoTarget.empresa}
          total={Number(pagoTarget.total)}
          estadoPago={pagoTarget.estadoPago}
          onConfirm={handlePago}
          titleOverride="Registrar Pago a Proveedor"
        />
      )}
    </div>
  );
}
