import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Producto } from "../../types";
import { BadgeStock } from "../common/badge";
import { getCategoriaInfo } from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";

interface Props {
  producto: Producto;
  onEdit: (p: Producto) => void;
  onDelete: (id: string) => void;
}

export default function ProductoCard({ producto: p, onEdit, onDelete }: Props) {
  const cat = getCategoriaInfo(p.cat);
  const margen =
    p.pcompra > 0 ? Math.round(((p.pventa - p.pcompra) / p.pventa) * 100) : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)")
      }
    >
      {/* Imagen */}
      <div
        className="h-36 flex items-center justify-center text-5xl relative flex-shrink-0"
        style={{ background: cat.color + "12" }}
      >
        {p.foto ? (
          <img
            src={p.foto}
            alt={p.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{cat.icon}</span>
        )}
        <div className="absolute top-2.5 right-2.5">
          <BadgeStock stock={p.stock} stockMin={p.stockMin} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: cat.color }}
          >
            {p.cat}
          </span>
          {p.sku && (
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {p.sku}
            </span>
          )}
        </div>
        <h4
          className="font-bold text-sm leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {p.nombre}
        </h4>
        {p.desc && (
          <p
            className="text-[11px] leading-relaxed line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            {p.desc}
          </p>
        )}

        {/* Precio y stock */}
        <div
          className="flex items-end justify-between mt-auto pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-lg font-extrabold tracking-tight"
              style={{ color: cat.color }}
            >
              {formatCOP(p.pventa)}
            </p>
            {p.pcompra > 0 && (
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Costo: {formatCOP(p.pcompra)} · {margen}% mrg
              </p>
            )}
          </div>
          <div className="text-right">
            <p
              className="text-base font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {p.stock}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {p.unidad}
            </p>
          </div>
        </div>

        {/* Tags */}
        {(p.barcode || p.iva > 0) && (
          <div className="flex gap-1.5 flex-wrap mt-1">
            {p.barcode && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: "var(--surface-3)",
                  color: "var(--text-secondary)",
                }}
              >
                {p.barcode}
              </span>
            )}
            {p.iva > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                style={{ backgroundColor: "#fef9c3", color: "#a16207" }}
              >
                IVA {p.iva}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => onEdit(p)}
          className="flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: "var(--surface-3)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--brand-subtle)";
            el.style.color = "var(--brand)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "var(--surface-3)";
            el.style.color = "var(--text-secondary)";
          }}
        >
          <FiEdit2 size={12} /> Editar
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#fecaca")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#fee2e2")
          }
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  );
}
