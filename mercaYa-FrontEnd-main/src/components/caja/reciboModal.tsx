import { useRef } from "react";
import { FiPrinter, FiDownload, FiX, FiCheck } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { formatCOP } from "../../utils/formatters";
import type { Venta } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  venta: Venta;
  montoPagado: number;
  metodoPago: string;
  vuelto?: number;
}

export default function ReciboModal({
  open,
  onClose,
  venta,
  montoPagado,
  metodoPago,
  vuelto = 0,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Recibo ${venta.id}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; color: #000; max-width: 320px; margin: auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .big { font-size: 18px; font-weight: 900; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 16px; font-weight: 900; }
        .vuelto { background: #f0fff4; padding: 8px; border-radius: 4px; text-align: center; margin: 8px 0; }
        .qr { text-align: center; margin: 12px 0; }
        .footer { text-align: center; font-size: 10px; color: #666; margin-top: 16px; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  if (!open) return null;

  const fecha = new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            className="font-extrabold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Recibo de pago
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <FiPrinter size={13} /> Imprimir
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--surface-3)",
                color: "var(--text-muted)",
              }}
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* Contenido del recibo — estilo ticket */}
        <div
          ref={printRef}
          className="p-5 font-mono text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {/* Cabecera */}
          <div className="center text-center mb-3">
            <p
              className="font-black text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              MercaYa
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Sistema de Gestión Comercial
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {fecha}
            </p>
          </div>

          <div
            className="border-t border-dashed"
            style={{ borderColor: "var(--border)" }}
          />

          {/* Datos orden */}
          <div className="py-3 space-y-1">
            {[
              ["N° Orden", venta.id],
              ["Cliente", venta.cliente],
              ["Método", metodoPago],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{k}</span>
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>

          <div
            className="border-t border-dashed"
            style={{ borderColor: "var(--border)" }}
          />

          {/* Productos */}
          <div className="py-3 space-y-1.5">
            {venta.prods?.map((p, i) => (
              <div key={i}>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.n}
                </p>
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>
                    {formatCOP(p.p)} × {p.q}
                    {p.d > 0 ? ` (-${p.d}%)` : ""}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatCOP(p.p * p.q * (1 - p.d / 100))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="border-t border-dashed"
            style={{ borderColor: "var(--border)" }}
          />

          {/* Totales */}
          <div className="py-3 space-y-1">
            <div
              className="flex justify-between text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Total orden</span>
              <span
                className="font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCOP(venta.total)}
              </span>
            </div>
            <div
              className="flex justify-between text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Monto pagado</span>
              <span
                className="font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCOP(montoPagado)}
              </span>
            </div>
            {vuelto > 0 && (
              <div
                className="flex justify-between text-sm font-black mt-2 p-2 rounded-lg"
                style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
              >
                <span>VUELTO</span>
                <span>{formatCOP(vuelto)}</span>
              </div>
            )}
            <div
              className="flex justify-between text-base font-black mt-2 pt-2"
              style={{
                borderTop: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <span>TOTAL</span>
              <span style={{ color: "var(--brand)" }}>
                {formatCOP(venta.total)}
              </span>
            </div>
          </div>

          {/* Estado */}
          <div className="text-center py-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
              style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
            >
              <FiCheck size={14} /> PAGADO
            </span>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <QRCodeSVG
              value={`${window.location.origin}/ventas?orden=${venta.id}`}
              size={80}
            />
            <p
              className="text-[10px] text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Escanea para verificar
            </p>
          </div>

          <div className="text-center pt-3">
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              ¡Gracias por su compra!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
