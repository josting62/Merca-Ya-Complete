import { useState, useEffect } from "react";
import {
  FiCheck,
  FiDollarSign,
  FiSmartphone,
  FiRepeat,
  FiX,
} from "react-icons/fi";
import { formatCOP } from "../../utils/formatters";
import type { Venta } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  venta: Venta;
  onConfirm: (monto: number, metodo: string) => Promise<void>;
}

const METODOS = [
  {
    value: "Efectivo",
    label: "Efectivo",
    icon: FiDollarSign,
    color: "#16a34a",
    bg: "#dcfce7",
  },
  {
    value: "Pago Móvil",
    label: "Pago Móvil",
    icon: FiSmartphone,
    color: "var(--brand)",
    bg: "var(--brand-subtle)",
  },
  {
    value: "Transferencia",
    label: "Transferencia",
    icon: FiRepeat,
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
];

export default function CobroModal({ open, onClose, venta, onConfirm }: Props) {
  const [metodo, setMetodo] = useState("Efectivo");
  const [recibido, setRecibido] = useState("");
  const [loading, setLoading] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [tipoPago, setTipoPago] = useState<"total" | "parcial">("total");

  useEffect(() => {
    if (open) {
      setMetodo("Efectivo");
      setRecibido("");
      setExitoso(false);
      setTipoPago("total");
    }
  }, [open]);

  const montoACobrar =
    tipoPago === "total" ? venta.total : parseFloat(recibido) || 0;
  const recibidoNum = parseFloat(recibido) || 0;
  const vuelto =
    metodo === "Efectivo" && recibidoNum > montoACobrar
      ? recibidoNum - montoACobrar
      : 0;
  const puedeConfirmar =
    metodo !== "Efectivo" ||
    (tipoPago === "total" && true) ||
    (tipoPago === "parcial" && recibidoNum > 0);

  const handleConfirm = async () => {
    if (!puedeConfirmar) return;
    setLoading(true);
    try {
      await onConfirm(montoACobrar, metodo);
      setExitoso(true);
      setTimeout(onClose, 1800);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header estilo TNS */}
        <div
          className="px-6 py-5 text-center"
          style={{
            background: exitoso
              ? "linear-gradient(135deg,#15803d,#16a34a)"
              : "linear-gradient(135deg,var(--brand-dark),var(--brand-light))",
          }}
        >
          {exitoso ? (
            <>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                <FiCheck size={28} color="#fff" />
              </div>
              <p className="text-white font-extrabold text-lg">
                ¡Pago registrado!
              </p>
              <p className="text-white/80 text-sm">
                {venta.id} — {venta.cliente}
              </p>
            </>
          ) : (
            <>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                Orden de cobro
              </p>
              <p className="text-white font-black text-3xl tracking-tight">
                {venta.id}
              </p>
              <p className="text-white/80 text-sm mt-1">{venta.cliente}</p>
            </>
          )}
        </div>

        {!exitoso && (
          <div className="p-6 space-y-5">
            {/* Total */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Total a cobrar
                </p>
                <p
                  className="text-3xl font-black tracking-tight"
                  style={{ color: "var(--brand)" }}
                >
                  {formatCOP(venta.total)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Estado actual
                </p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-1"
                  style={{
                    backgroundColor:
                      venta.estadoPago === "pagado" ? "#dcfce7" : "#fef9c3",
                    color:
                      venta.estadoPago === "pagado" ? "#15803d" : "#a16207",
                  }}
                >
                  {venta.estadoPago === "pagado"
                    ? "Pagado"
                    : venta.estadoPago === "parcial"
                      ? "Parcial"
                      : "No pagado"}
                </span>
              </div>
            </div>

            {/* Productos resumen */}
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {venta.prods?.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between text-xs py-1"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {p.n} × {p.q}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCOP(p.p * p.q * (1 - p.d / 100))}
                  </span>
                </div>
              ))}
            </div>

            {/* Tipo de pago */}
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "total",
                    label: "Cobro total",
                    sub: "Salda completamente",
                  },
                  {
                    id: "parcial",
                    label: "Cobro parcial",
                    sub: "Registrar abono",
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipoPago(t.id)}
                  className="p-3 rounded-xl text-center transition-all"
                  style={
                    tipoPago === t.id
                      ? {
                          border: "2px solid var(--brand)",
                          backgroundColor: "var(--brand-subtle)",
                        }
                      : {
                          border: "2px solid var(--border)",
                          backgroundColor: "transparent",
                        }
                  }
                >
                  <p
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.label}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.sub}
                  </p>
                </button>
              ))}
            </div>

            {/* Método */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Método de pago
              </p>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMetodo(m.value)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                      style={
                        metodo === m.value
                          ? {
                              border: `2px solid ${m.color}`,
                              backgroundColor: m.bg,
                            }
                          : {
                              border: "2px solid var(--border)",
                              backgroundColor: "transparent",
                            }
                      }
                    >
                      <Icon
                        size={18}
                        style={{
                          color:
                            metodo === m.value ? m.color : "var(--text-muted)",
                        }}
                      />
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color:
                            metodo === m.value ? m.color : "var(--text-muted)",
                        }}
                      >
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monto recibido (efectivo) */}
            {metodo === "Efectivo" && (
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tipoPago === "parcial"
                    ? "Monto del abono"
                    : "Efectivo recibido"}
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-3"
                  style={{
                    backgroundColor: "var(--surface-2)",
                    border: "2px solid var(--border)",
                  }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={recibido}
                    onChange={(e) => setRecibido(e.target.value)}
                    placeholder={formatCOP(venta.total).replace("$", "")}
                    className="flex-1 bg-transparent text-2xl font-black outline-none"
                    style={{ color: "var(--text-primary)" }}
                    autoFocus
                  />
                </div>

                {/* Vuelto */}
                {recibidoNum > 0 &&
                  metodo === "Efectivo" &&
                  tipoPago === "total" && (
                    <div
                      className={`mt-2 p-3 rounded-xl flex justify-between items-center`}
                      style={{
                        backgroundColor:
                          vuelto > 0
                            ? "#dcfce7"
                            : recibidoNum < venta.total
                              ? "#fee2e2"
                              : "#dcfce7",
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            vuelto > 0
                              ? "#15803d"
                              : recibidoNum < venta.total
                                ? "#dc2626"
                                : "#15803d",
                        }}
                      >
                        {vuelto > 0
                          ? "Vuelto"
                          : recibidoNum < venta.total
                            ? "Falta"
                            : "Exacto ✓"}
                      </span>
                      <span
                        className="text-xl font-black"
                        style={{ color: vuelto > 0 ? "#15803d" : "#dc2626" }}
                      >
                        {vuelto > 0
                          ? formatCOP(vuelto)
                          : recibidoNum < venta.total
                            ? formatCOP(venta.total - recibidoNum)
                            : ""}
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-2 flex-grow-[2] py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--brand)",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                {loading ? (
                  "Procesando..."
                ) : (
                  <>
                    <FiCheck size={16} /> Confirmar cobro
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
