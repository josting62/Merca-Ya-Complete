import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiPrinter, FiX } from "react-icons/fi";
import { formatCOP } from "../../utils/formatters";
import type { Venta, Despacho } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  venta: Venta;
  despacho: Despacho;
}

const ESTADO_LABEL: Record<string, string> = {
  en_empresa: "En empresa",
  en_ruta: "En ruta",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function OrdenModal({ open, onClose, venta, despacho }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal =
    venta.prods?.reduce((s, p) => s + p.p * p.q * (1 - p.d / 100), 0) || 0;
  const descTotal =
    venta.prods?.reduce((s, p) => s + p.p * p.q * (p.d / 100), 0) || 0;
  const iva = subtotal * 0.19;
  const rastreoUrl = `${window.location.origin}/rastreo/${despacho.codigo}`;

  const fecha = new Date(despacho.created_at).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    if (!win || !content) return;
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Orden ${despacho.codigo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    color: #111;
    padding: 24px;
    max-width: 800px;
    margin: auto;
  }
  /* Cabecera empresa */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 3px solid #1a1a2e; padding-bottom: 12px; }
  .empresa-nombre { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -0.5px; }
  .empresa-sub { font-size: 10px; color: #666; margin-top: 2px; }
  .doc-numero { font-size: 20px; font-weight: 900; color: #3b5bdb; text-align: right; }
  .doc-fecha { font-size: 10px; color: #666; text-align: right; margin-top: 2px; }
  .doc-estado { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; margin-top: 4px; background: #fef9c3; color: #a16207; }
  /* Info cliente */
  .seccion-titulo { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 14px 0 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
  .info-item label { display: block; font-size: 8px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 2px; }
  .info-item span { font-size: 11px; font-weight: 600; color: #111; }
  .info-full { grid-column: 1 / -1; }
  /* Tabla productos */
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead tr { background: #1a1a2e; }
  thead th { padding: 7px 8px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #fff; letter-spacing: 0.5px; }
  thead th:last-child, thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 7px 8px; font-size: 11px; color: #374151; }
  tbody td:nth-child(2), tbody td:nth-child(3), tbody td:nth-child(4), tbody td:nth-child(5) { text-align: right; }
  /* Totales */
  .totales { margin-top: 8px; display: flex; justify-content: flex-end; }
  .totales-box { width: 260px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  .totales-row { display: flex; justify-content: space-between; padding: 5px 12px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
  .totales-row.total { background: #1a1a2e; color: #fff; font-size: 14px; font-weight: 900; border: none; padding: 8px 12px; }
  .totales-row.total span:last-child { color: #93c5fd; }
  /* Obs */
  .obs-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; min-height: 40px; font-size: 11px; color: #6b7280; margin-top: 4px; }
  /* QR + firmas */
  .bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 20px; align-items: end; }
  .firma { text-align: center; }
  .firma-linea { border-top: 1px solid #9ca3af; padding-top: 4px; margin-top: 40px; font-size: 9px; color: #9ca3af; }
  .qr-box { text-align: center; }
  .qr-box p { font-size: 9px; color: #9ca3af; margin-top: 4px; }
  .qr-url { font-size: 8px; color: #3b5bdb; word-break: break-all; }
  /* Footer */
  .footer { margin-top: 20px; border-top: 2px solid #1a1a2e; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }
  .son { font-size: 10px; font-weight: 700; color: #374151; margin-top: 8px; }
  @media print {
    body { padding: 12px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header modal */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--brand-subtle)",
                color: "var(--brand)",
              }}
            >
              <FiPrinter size={14} />
            </div>
            <div>
              <p
                className="font-extrabold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Orden de Despacho
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {despacho.codigo}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all"
              style={{
                backgroundColor: "var(--brand)",
                boxShadow: "var(--shadow-brand)",
              }}
            >
              <FiPrinter size={13} /> Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                backgroundColor: "var(--surface-3)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "#fee2e2";
                el.style.color = "#dc2626";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "var(--surface-3)";
                el.style.color = "var(--text-muted)";
              }}
            >
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* ── CONTENIDO IMPRIMIBLE ── */}
        <div ref={printRef} className="p-6">
          {/* ── CABECERA ESTILO FACTURA ── */}
          <div
            className="header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "3px solid #1a1a2e",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <div
                className="empresa-nombre"
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#1a1a2e",
                  letterSpacing: "-0.5px",
                }}
              >
                MercaYa
              </div>
              <div
                className="empresa-sub"
                style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}
              >
                Sistema de Gestión Comercial
              </div>
              <div
                style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}
              >
                NIT: 000.000.000-0
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                Régimen: Responsable de IVA
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                Cúcuta, Norte de Santander
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Orden de Despacho
              </div>
              <div
                className="doc-numero"
                style={{ fontSize: "22px", fontWeight: 900, color: "#3b5bdb" }}
              >
                N° {despacho.codigo}
              </div>
              <div
                style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}
              >
                Fecha: {fecha}
              </div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                Venta: {venta.id}
              </div>
              <div style={{ marginTop: "6px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background:
                      despacho.estado === "entregado"
                        ? "#dcfce7"
                        : despacho.estado === "en_ruta"
                          ? "#dbeafe"
                          : despacho.estado === "cancelado"
                            ? "#fee2e2"
                            : "#fef9c3",
                    color:
                      despacho.estado === "entregado"
                        ? "#15803d"
                        : despacho.estado === "en_ruta"
                          ? "#1d4ed8"
                          : despacho.estado === "cancelado"
                            ? "#dc2626"
                            : "#a16207",
                  }}
                >
                  {ESTADO_LABEL[despacho.estado] || despacho.estado}
                </span>
              </div>
            </div>
          </div>

          {/* ── INFO CLIENTE ── */}
          <div
            className="seccion-titulo"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#6b7280",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
              margin: "14px 0 8px",
            }}
          >
            Información del Cliente
          </div>
          <div
            className="info-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              background: "#f8fafc",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
            }}
          >
            {[
              ["Razón Social / Nombre", despacho.cliente_nombre],
              ["NIT / Cédula", despacho.cliente_doc || "—"],
              ["Teléfono", despacho.cliente_tel || "—"],
              ["Correo electrónico", despacho.cliente_email || "—"],
              ["Ciudad de entrega", despacho.ciudad],
              ["Forma de pago", venta.metodo],
            ].map(([k, v]) => (
              <div key={k} className="info-item">
                <label
                  style={{
                    display: "block",
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#9ca3af",
                    marginBottom: "2px",
                  }}
                >
                  {k}
                </label>
                <span
                  style={{ fontSize: "11px", fontWeight: 600, color: "#111" }}
                >
                  {v}
                </span>
              </div>
            ))}
            <div
              className="info-item info-full"
              style={{ gridColumn: "1 / -1" }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "8px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  marginBottom: "2px",
                }}
              >
                Dirección de entrega
              </label>
              <span
                style={{ fontSize: "11px", fontWeight: 600, color: "#111" }}
              >
                {despacho.direccion}
              </span>
            </div>
          </div>

          {/* ── TABLA PRODUCTOS ── */}
          <div
            className="seccion-titulo"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#6b7280",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
              margin: "14px 0 8px",
            }}
          >
            Detalle de productos
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a1a2e" }}>
                {[
                  "Descripción",
                  "Precio Unit.",
                  "Cant.",
                  "Desc. %",
                  "Subtotal",
                ].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "7px 8px",
                      textAlign: i === 0 ? "left" : "right",
                      fontSize: "9px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#fff",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {venta.prods?.map((p, i) => {
                const sub = p.p * p.q * (1 - p.d / 100);
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: i % 2 === 1 ? "#f8fafc" : "#fff",
                    }}
                  >
                    <td
                      style={{
                        padding: "7px 8px",
                        fontSize: "11px",
                        color: "#374151",
                        fontWeight: 600,
                      }}
                    >
                      {p.n}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        fontSize: "11px",
                        color: "#374151",
                        textAlign: "right",
                      }}
                    >
                      {formatCOP(p.p)}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        fontSize: "11px",
                        color: "#374151",
                        textAlign: "right",
                      }}
                    >
                      {p.q}
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        fontSize: "11px",
                        color: "#374151",
                        textAlign: "right",
                      }}
                    >
                      {p.d}%
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        textAlign: "right",
                      }}
                    >
                      {formatCOP(sub)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── TOTALES ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                width: "260px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {[
                ["Valor Bruto", formatCOP(subtotal + descTotal)],
                [
                  "Descuento",
                  descTotal > 0 ? `-${formatCOP(descTotal)}` : formatCOP(0),
                ],
                ["Subtotal", formatCOP(subtotal)],
                ["IVA (19%)", formatCOP(iva)],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 12px",
                    fontSize: "11px",
                    borderBottom: "1px solid #f1f5f9",
                    color: "#374151",
                  }}
                >
                  <span>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#1a1a2e",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 900,
                }}
              >
                <span>TOTAL</span>
                <span style={{ color: "#93c5fd" }}>
                  {formatCOP(venta.total)}
                </span>
              </div>
            </div>
          </div>

          {/* ── SON ── */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#374151",
              marginTop: "8px",
              padding: "6px 0",
              borderTop: "1px dashed #e5e7eb",
            }}
          >
            SON:{" "}
            <span style={{ textTransform: "uppercase" }}>
              {numberToWords(venta.total)} PESOS M/CTE
            </span>
          </div>

          {/* ── OBSERVACIONES ── */}
          <div
            className="seccion-titulo"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#6b7280",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "4px",
              margin: "14px 0 8px",
            }}
          >
            Observaciones
          </div>
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px 12px",
              minHeight: "36px",
              fontSize: "11px",
              color: "#6b7280",
            }}
          >
            {despacho.notas || "Sin observaciones"}
          </div>

          {/* ── QR + FIRMAS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginTop: "24px",
              alignItems: "end",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #9ca3af",
                  paddingTop: "4px",
                  marginTop: "48px",
                  fontSize: "9px",
                  color: "#9ca3af",
                }}
              >
                Firma despachador
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <QRCodeSVG
                value={rastreoUrl}
                size={80}
                style={{ margin: "0 auto" }}
              />
              <p
                style={{ fontSize: "9px", color: "#9ca3af", marginTop: "4px" }}
              >
                Escanea para rastrear
              </p>
              <p
                style={{
                  fontSize: "8px",
                  color: "#3b5bdb",
                  wordBreak: "break-all",
                }}
              >
                {rastreoUrl}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #9ca3af",
                  paddingTop: "4px",
                  marginTop: "48px",
                  fontSize: "9px",
                  color: "#9ca3af",
                }}
              >
                Firma cliente
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              marginTop: "20px",
              borderTop: "2px solid #1a1a2e",
              paddingTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
              color: "#9ca3af",
            }}
          >
            <span>MercaYa — Sistema de Gestión Comercial</span>
            <span>
              Documento generado el {new Date().toLocaleString("es-CO")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Utilidad: número a palabras (simplificado para COP) ──
function numberToWords(n: number): string {
  const num = Math.round(n);
  if (num === 0) return "CERO";
  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISÉIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];
  const decenas = [
    "",
    "",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  const convertir = (n: number): string => {
    if (n === 0) return "";
    if (n === 100) return "CIEN";
    if (n < 20) return unidades[n];
    if (n < 100)
      return (
        decenas[Math.floor(n / 10)] + (n % 10 ? " Y " + unidades[n % 10] : "")
      );
    if (n < 1000)
      return (
        centenas[Math.floor(n / 100)] +
        (n % 100 ? " " + convertir(n % 100) : "")
      );
    if (n < 1000000) {
      const m = Math.floor(n / 1000);
      return (
        (m === 1 ? "MIL" : convertir(m) + " MIL") +
        (n % 1000 ? " " + convertir(n % 1000) : "")
      );
    }
    const m = Math.floor(n / 1000000);
    return (
      (m === 1 ? "UN MILLÓN" : convertir(m) + " MILLONES") +
      (n % 1000000 ? " " + convertir(n % 1000000) : "")
    );
  };

  return convertir(num);
}
