import { useEffect, useState } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import {
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiRepeat,
  FiSmartphone,
  FiCheck,
  FiClock,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { useCajaStore } from "../store/cajaStore";
import { usePermissions } from "../hooks/usePermissions";
import { useAuthStore } from "../store/authStore";
import Topbar from "../components/layout/topBar";
import Spinner from "../components/common/spinner";
import CobroModal from "../components/caja/cobroModal";
import ReciboModal from "../components/caja/reciboModal";
import { BadgePago, BadgeEstado } from "../components/common/badge";
import { formatCOP } from "../utils/formatters";
import type { Venta } from "../types";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
};

export default function CajaPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const perms = usePermissions();
  const { user } = useAuthStore();

  if (!perms.usarCaja) return <Navigate to="/ventas" replace />;

  const {
    ventas,
    ventaActiva,
    resumen,
    loading,
    buscando,
    fetchVentas,
    buscarPorCodigo,
    cobrar,
    setVentaActiva,
  } = useCajaStore();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "pagadas">(
    "todas",
  );
  const [cobroModal, setCobroModal] = useState(false);
  const [reciboData, setReciboData] = useState<{
    venta: Venta;
    monto: number;
    metodo: string;
    vuelto: number;
  } | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  useEffect(() => {
    fetchVentas();
  }, []);

  // Filtrar lista izquierda
  const listaFiltrada = ventas.filter((v) => {
    const matchSearch =
      !busqueda ||
      v.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cliente.toLowerCase().includes(busqueda.toLowerCase());
    const matchFiltro =
      filtro === "todas"
        ? true
        : filtro === "pendientes"
          ? v.estadoPago !== "pagado"
          : v.estadoPago === "pagado";
    return matchSearch && matchFiltro;
  });

  const handleBuscarCodigo = async () => {
    if (!busqueda.trim()) return;
    setErrorBusqueda("");
    const venta = await buscarPorCodigo(busqueda);
    if (!venta) {
      setErrorBusqueda(`No se encontró la orden "${busqueda}"`);
    }
  };

  const handleCobrar = async (monto: number, metodo: string) => {
    if (!ventaActiva) return;
    const recibidoNum = metodo === "Efectivo" ? monto : monto;
    const vueltoCalc =
      metodo === "Efectivo" ? Math.max(recibidoNum - ventaActiva.total, 0) : 0;
    await cobrar(ventaActiva.id, Math.min(monto, ventaActiva.total), metodo);
    setCobroModal(false);
    setReciboData({
      venta: ventaActiva,
      monto: Math.min(monto, ventaActiva.total),
      metodo,
      vuelto: vueltoCalc,
    });
  };

  if (loading)
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Caja" onMenuClick={onMenuClick} />
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Caja"
        subtitle={`Cajera: ${user?.nombre || ""}`}
        onMenuClick={onMenuClick}
      />

      <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-5 gap-4">
        {/* Resumen del día */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
          {[
            {
              label: "Cobrado hoy",
              value: formatCOP(resumen.totalCobrado),
              color: "var(--brand)",
              icon: FiTrendingUp,
            },
            {
              label: "Transacciones",
              value: resumen.totalTransacciones,
              color: "#16a34a",
              icon: FiCheck,
            },
            {
              label: "Efectivo",
              value: formatCOP(resumen.efectivo),
              color: "#16a34a",
              icon: FiDollarSign,
            },
            {
              label: "Digital",
              value: formatCOP(resumen.movil + resumen.transferencia),
              color: "#7c3aed",
              icon: FiSmartphone,
            },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                style={cardStyle}
                className="p-3.5 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: k.color + "18", color: k.color }}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {k.label}
                  </p>
                  <p
                    className="text-base font-extrabold truncate"
                    style={{ color: k.color }}
                  >
                    {k.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vista dividida */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* ── Columna izquierda: lista de órdenes ── */}
          <div className="md:col-span-2 flex flex-col gap-3 overflow-hidden">
            {/* Buscador por código */}
            <div style={cardStyle} className="p-3 flex-shrink-0">
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Buscar por número de orden
              </p>
              <div className="flex gap-2">
                <div
                  className="flex-1 flex items-center gap-2 rounded-xl px-3"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <FiSearch size={13} style={{ color: "var(--text-muted)" }} />
                  <input
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setErrorBusqueda("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleBuscarCodigo()}
                    placeholder="Ej: VT-0001"
                    className="flex-1 bg-transparent text-sm py-2.5 outline-none font-mono"
                    style={{ color: "var(--text-primary)" }}
                  />
                  {busqueda && (
                    <button
                      onClick={() => {
                        setBusqueda("");
                        setErrorBusqueda("");
                        setVentaActiva(null);
                      }}
                    >
                      <FiX size={13} style={{ color: "var(--text-muted)" }} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleBuscarCodigo}
                  disabled={buscando}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  {buscando ? "..." : "Buscar"}
                </button>
              </div>
              {errorBusqueda && (
                <p
                  className="text-xs mt-1.5 font-medium"
                  style={{ color: "#dc2626" }}
                >
                  {errorBusqueda}
                </p>
              )}
            </div>

            {/* Filtros */}
            <div
              className="flex gap-1 p-1 rounded-xl flex-shrink-0"
              style={{ backgroundColor: "var(--surface-3)" }}
            >
              {(
                [
                  { id: "todas", label: "Todas" },
                  { id: "pendientes", label: "Pendientes" },
                  { id: "pagadas", label: "Pagadas" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                  style={
                    filtro === f.id
                      ? {
                          backgroundColor: "var(--surface)",
                          color: "var(--text-primary)",
                          boxShadow: "var(--shadow-sm)",
                        }
                      : {
                          color: "var(--text-muted)",
                          backgroundColor: "transparent",
                        }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Lista órdenes */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {listaFiltrada.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FiClock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin órdenes</p>
                </div>
              ) : (
                listaFiltrada.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setVentaActiva(v)}
                    className="p-3.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      backgroundColor:
                        ventaActiva?.id === v.id
                          ? "var(--brand-subtle)"
                          : "var(--surface)",
                      border: `1px solid ${ventaActiva?.id === v.id ? "var(--brand)" : "var(--border)"}`,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <p
                        className="text-sm font-black font-mono"
                        style={{
                          color:
                            ventaActiva?.id === v.id
                              ? "var(--brand)"
                              : "var(--text-primary)",
                        }}
                      >
                        {v.id}
                      </p>
                      <BadgePago estado={v.estadoPago} />
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {v.cliente}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p
                        className="text-base font-extrabold"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(v.total)}
                      </p>
                      <BadgeEstado estado={v.estado} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Columna derecha: detalle de orden activa ── */}
          <div className="md:col-span-3 flex flex-col gap-3 overflow-hidden">
            {!ventaActiva ? (
              <div
                style={{ ...cardStyle, flex: 1 }}
                className="flex flex-col items-center justify-center text-center p-8"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "var(--brand-subtle)",
                    color: "var(--brand)",
                  }}
                >
                  <FiCreditCard size={28} />
                </div>
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Selecciona una orden
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Busca por código o selecciona de la lista para cobrar
                </p>
              </div>
            ) : (
              <>
                {/* Header orden */}
                <div style={cardStyle} className="p-4 flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p
                        className="text-2xl font-black font-mono"
                        style={{ color: "var(--brand)" }}
                      >
                        {ventaActiva.id}
                      </p>
                      <p
                        className="text-sm font-semibold mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {ventaActiva.cliente}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BadgePago estado={ventaActiva.estadoPago} />
                      <BadgeEstado estado={ventaActiva.estado} />
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Método: {ventaActiva.metodo}
                    </span>
                    <span
                      className="text-2xl font-black"
                      style={{ color: "var(--brand)" }}
                    >
                      {formatCOP(ventaActiva.total)}
                    </span>
                  </div>
                </div>

                {/* Productos */}
                <div
                  style={{ ...cardStyle, flex: 1, overflow: "hidden" }}
                  className="flex flex-col"
                >
                  <div
                    className="px-4 py-3 flex-shrink-0"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Productos — {ventaActiva.prods?.length || 0} ítem
                      {ventaActiva.prods?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {ventaActiva.prods?.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2.5"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {p.n}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatCOP(p.p)} × {p.q}
                            {p.d > 0 ? ` · Desc. ${p.d}%` : ""}
                          </p>
                        </div>
                        <p
                          className="font-bold"
                          style={{ color: "var(--brand)" }}
                        >
                          {formatCOP(p.p * p.q * (1 - p.d / 100))}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className="p-4 flex-shrink-0"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ backgroundColor: "var(--brand-subtle)" }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-2xl font-black"
                        style={{ color: "var(--brand)" }}
                      >
                        {formatCOP(ventaActiva.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón cobrar */}
                {ventaActiva.estadoPago !== "pagado" && (
                  <button
                    onClick={() => setCobroModal(true)}
                    className="w-full py-4 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2 flex-shrink-0"
                    style={{
                      backgroundColor: "var(--brand)",
                      boxShadow: "var(--shadow-brand)",
                    }}
                  >
                    <FiCreditCard size={18} /> Cobrar{" "}
                    {formatCOP(ventaActiva.total)}
                  </button>
                )}

                {ventaActiva.estadoPago === "pagado" && (
                  <div
                    className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 flex-shrink-0"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                  >
                    <FiCheck size={18} /> Ya fue cobrada
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      {ventaActiva && (
        <CobroModal
          open={cobroModal}
          onClose={() => setCobroModal(false)}
          venta={ventaActiva}
          onConfirm={handleCobrar}
        />
      )}

      {reciboData && (
        <ReciboModal
          open={!!reciboData}
          onClose={() => setReciboData(null)}
          venta={reciboData.venta}
          montoPagado={reciboData.monto}
          metodoPago={reciboData.metodo}
          vuelto={reciboData.vuelto}
        />
      )}
    </div>
  );
}
