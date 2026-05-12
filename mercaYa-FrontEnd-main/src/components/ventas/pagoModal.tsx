import { useState } from "react";
import { FiCheck, FiDollarSign, FiSmartphone, FiRepeat } from "react-icons/fi";
import Modal from "../common/modal";
import Button from "../common/button";
import { METODOS_PAGO } from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";

interface Props {
  open: boolean;
  onClose: () => void;
  ventaId: string;
  clienteNombre: string;
  total: number;
  estadoPago: string;
  onConfirm: (monto: number, metodo: string) => Promise<void>;
  titleOverride?: string;
}

const METODO_ICONS: Record<string, React.ReactNode> = {
  Efectivo: <FiDollarSign size={13} />,
  "Pago Movil": <FiSmartphone size={13} />,
  Transferencia: <FiRepeat size={13} />,
};

export default function PagoModal({
  open,
  onClose,
  ventaId,
  clienteNombre,
  total,
  estadoPago,
  onConfirm,
  titleOverride,
}: Props) {
  const [tipo, setTipo] = useState<"total" | "parcial">("total");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("");
  const [loading, setLoading] = useState(false);

  // FIX: para pago parcial, el monto no puede superar el total
  const montoNum =
    tipo === "total" ? total : Math.min(Math.max(0, +monto || 0), total);

  const nuevoEstado = montoNum >= total ? "pagado" : "parcial";

  // Actualiza el input limitando al total
  const handleMontoChange = (val: string) => {
    const num = parseFloat(val) || 0;
    if (num > total) {
      setMonto(String(total));
    } else {
      setMonto(val);
    }
  };

  const handleConfirm = async () => {
    if (!metodo) return;
    if (tipo === "parcial" && (!monto || +monto <= 0)) return;
    setLoading(true);
    try {
      await onConfirm(montoNum, metodo);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleOverride || "Registrar Pago"}
      subtitle={`${ventaId} · ${clienteNombre}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !metodo}
            variant="success"
          >
            <FiCheck size={14} /> {loading ? "Procesando..." : "Confirmar pago"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Resumen */}
        <div
          className="rounded-xl p-4 space-y-1.5 text-sm"
          style={{ backgroundColor: "var(--surface-2)" }}
        >
          {[
            ["Referencia", ventaId],
            ["Cliente / Empresa", clienteNombre],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>{k}</span>
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {v}
              </span>
            </div>
          ))}
          <div
            className="flex justify-between pt-1.5 mt-1.5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span
              className="font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Total
            </span>
            <span
              className="font-extrabold text-base"
              style={{ color: "var(--brand)" }}
            >
              {formatCOP(total)}
            </span>
          </div>
        </div>

        {/* Tipo de pago */}
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                id: "total",
                label: "Pago completo",
                sub: "Salda la deuda total",
                icon: <FiCheck size={18} />,
              },
              {
                id: "parcial",
                label: "Pago parcial",
                sub: "Registrar abono",
                icon: <FiDollarSign size={18} />,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTipo(t.id);
                setMonto("");
              }}
              className="p-3.5 rounded-xl text-center transition-all"
              style={
                tipo === t.id
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
              <div
                className="flex justify-center mb-1"
                style={{
                  color: tipo === t.id ? "var(--brand)" : "var(--text-muted)",
                }}
              >
                {t.icon}
              </div>
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

        {/* Monto parcial — con límite máximo = total */}
        {tipo === "parcial" && (
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Monto del abono (máx. {formatCOP(total)})
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                $
              </span>
              <input
                type="number"
                min="1"
                max={total}
                value={monto}
                onChange={(e) => handleMontoChange(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-lg font-extrabold outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            {monto && +monto > 0 && (
              <p
                className="text-xs mt-1.5 font-medium"
                style={{ color: +monto >= total ? "#16a34a" : "#a16207" }}
              >
                {+monto >= total
                  ? "Cubre el total — quedara Pagado"
                  : `Saldo restante: ${formatCOP(total - +monto)} — quedara Parcial`}
              </p>
            )}
          </div>
        )}

        {/* Método */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Metodo de pago recibido
          </p>
          <div className="flex gap-2 flex-wrap">
            {METODOS_PAGO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={
                  metodo === m
                    ? {
                        border: "2px solid #16a34a",
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                      }
                    : {
                        border: "2px solid var(--border)",
                        color: "var(--text-muted)",
                        backgroundColor: "transparent",
                      }
                }
              >
                {METODO_ICONS[m]} {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
