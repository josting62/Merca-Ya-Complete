import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { useCarteraStore } from "../store/carteraStore";
import Topbar from "../components/layout/topBar";
import Spinner from "../components/common/spinner";
import PagoModal from "../components/ventas/pagoModal";
import { BadgePago } from "../components/common/badge";
import { formatCOP, formatDate } from "../utils/formatters";

type Tab = "cobrar" | "pagar" | "historial";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
};

export default function CarteraPage() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const {
    cobrar,
    pagar,
    historial,
    loading,
    fetchCobrar,
    fetchPagar,
    fetchHistorial,
    registrarCobro,
    registrarPago,
  } = useCarteraStore();

  const [tab, setTab] = useState<Tab>("cobrar");
  const [cobroTarget, setCobroTarget] = useState<any>(null);
  const [pagoTarget, setPagoTarget] = useState<any>(null);

  useEffect(() => {
    fetchCobrar();
    fetchPagar();
    fetchHistorial();
  }, []);

  const totalCobrar = cobrar.reduce((s, c) => s + Number(c.total), 0);
  const totalPagar = pagar.reduce((s, p) => s + Number(p.total), 0);

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "cobrar", label: "Por cobrar", count: cobrar.length },
    { id: "pagar", label: "Por pagar", count: pagar.length },
    { id: "historial", label: "Historial", count: historial.length },
  ];

  // FIX pago parcial: después de registrar, recarga la lista
  const handleCobro = async (monto: number, metodo: string) => {
    await registrarCobro(cobroTarget.id, monto, metodo);
    setCobroTarget(null);
    fetchCobrar();
    fetchHistorial();
  };

  const handlePago = async (monto: number, metodo: string) => {
    await registrarPago(pagoTarget.id, monto, metodo);
    setPagoTarget(null);
    fetchPagar();
    fetchHistorial();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Cartera" onMenuClick={onMenuClick} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div style={cardStyle} className="p-5">
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Total por cobrar
            </p>
            <p
              className="text-2xl font-extrabold"
              style={{ color: "var(--brand)" }}
            >
              {formatCOP(totalCobrar)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {cobrar.length} factura{cobrar.length !== 1 ? "s" : ""} pendiente
              {cobrar.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={cardStyle} className="p-5">
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Total por pagar
            </p>
            <p className="text-2xl font-extrabold" style={{ color: "#dc2626" }}>
              {formatCOP(totalPagar)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {pagar.length} orden{pagar.length !== 1 ? "es" : ""} pendiente
              {pagar.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ backgroundColor: "var(--surface-3)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              style={
                tab === t.id
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
              {t.label}
              {t.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    tab === t.id
                      ? { backgroundColor: "var(--brand)", color: "#fff" }
                      : {
                          backgroundColor: "var(--border)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* Por cobrar */}
            {tab === "cobrar" && (
              <div className="space-y-3">
                {cobrar.length === 0 ? (
                  <div
                    className="text-center py-16"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <FiCheck size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      Todo cobrado - sin cuentas pendientes
                    </p>
                  </div>
                ) : (
                  cobrar.map((c) => (
                    <div
                      key={c.id}
                      style={cardStyle}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
                          }}
                        >
                          {c.cliente.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-sm truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {c.cliente}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs font-mono"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {c.id}
                            </span>
                            <BadgePago estado={c.estadoPago} />
                          </div>
                          {c.fechaPago && (
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Vence: {formatDate(c.fechaPago)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p
                          className="text-lg font-extrabold"
                          style={{ color: "var(--brand)" }}
                        >
                          {formatCOP(c.total)}
                        </p>
                        <button
                          onClick={() => setCobroTarget(c)}
                          className="px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all"
                          style={{
                            backgroundColor: "var(--brand)",
                            boxShadow: "var(--shadow-brand)",
                          }}
                        >
                          Cobrar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Por pagar */}
            {tab === "pagar" && (
              <div className="space-y-3">
                {pagar.length === 0 ? (
                  <div
                    className="text-center py-16"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <FiCheck size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      Sin deudas con proveedores
                    </p>
                  </div>
                ) : (
                  pagar.map((p) => (
                    <div
                      key={p.id}
                      style={cardStyle}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #a78bfa, #7c3aed)",
                          }}
                        >
                          {p.empresa.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-sm truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {p.empresa}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs font-mono"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {p.id}
                            </span>
                            <BadgePago estado={p.estadoPago} />
                            {p.cuotas > 1 && (
                              <span
                                className="text-[11px] font-semibold"
                                style={{ color: "#7c3aed" }}
                              >
                                {p.cuotas} cuotas
                              </span>
                            )}
                          </div>
                          {p.fechaPago && (
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Vence: {formatDate(p.fechaPago)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p
                          className="text-lg font-extrabold"
                          style={{ color: "#7c3aed" }}
                        >
                          {formatCOP(p.total)}
                        </p>
                        <button
                          onClick={() => setPagoTarget(p)}
                          className="px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all"
                          style={{ backgroundColor: "#7c3aed" }}
                        >
                          Pagar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Historial */}
            {tab === "historial" && (
              <div style={{ ...cardStyle, overflow: "hidden" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {[
                          "Fecha",
                          "Tipo",
                          "Nombre",
                          "Concepto",
                          "Metodo",
                          "Monto",
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
                      {historial.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Sin movimientos registrados
                          </td>
                        </tr>
                      ) : (
                        historial.map((p) => (
                          <tr
                            key={p.id}
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
                              className="px-4 py-3 text-xs whitespace-nowrap"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {formatDate(p.fecha)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                                style={
                                  p.tipo === "cobro"
                                    ? {
                                        backgroundColor: "var(--brand-subtle)",
                                        color: "var(--brand)",
                                      }
                                    : {
                                        backgroundColor: "#f3e8ff",
                                        color: "#7c3aed",
                                      }
                                }
                              >
                                {p.tipo === "cobro" ? "Cobro" : "Pago"}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3 text-sm font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {p.nombre}
                            </td>
                            <td
                              className="px-4 py-3 text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {p.concepto}
                            </td>
                            <td
                              className="px-4 py-3 text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {p.metodo}
                            </td>
                            <td
                              className="px-4 py-3 text-sm font-extrabold whitespace-nowrap"
                              style={{ color: "#16a34a" }}
                            >
                              {formatCOP(p.monto)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PagoModal para cobros */}
      {cobroTarget && (
        <PagoModal
          open={!!cobroTarget}
          onClose={() => setCobroTarget(null)}
          ventaId={cobroTarget.id}
          clienteNombre={cobroTarget.cliente}
          total={Number(cobroTarget.total)}
          estadoPago={cobroTarget.estadoPago}
          onConfirm={handleCobro}
        />
      )}

      {/* PagoModal para pagos a proveedor */}
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
