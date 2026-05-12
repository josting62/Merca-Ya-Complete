import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { getCategoriaInfo } from "../../utils/constants";
import { formatCOP } from "../../utils/formatters";

interface Props {
  name: string;
  total: number;
  enStock: number;
  bajo: number;
  sinStock: number;
  valor: number;
  onClick: () => void;
}

export default function CategoriaCard({
  name,
  total,
  enStock,
  bajo,
  sinStock,
  valor,
  onClick,
}: Props) {
  const cat = getCategoriaInfo(name);
  const alertas = bajo + sinStock;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = cat.color + "66";
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 8px 24px ${cat.color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Barra de color */}
      <div className="h-1" style={{ background: cat.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: cat.color + "18" }}
            >
              {cat.icon}
            </div>
            <div>
              <h3
                className="font-extrabold text-sm tracking-tight leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {name}
              </h3>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {total} referencias
              </p>
            </div>
          </div>
          {alertas > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0"
              style={{
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecdd3",
              }}
            >
              <FiAlertTriangle size={9} /> {alertas}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <p
              className="text-lg font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {total}
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Refs.
            </p>
          </div>
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <p className="text-lg font-extrabold" style={{ color: "#15803d" }}>
              {enStock}
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-wide"
              style={{ color: "#16a34a" }}
            >
              Ok
            </p>
          </div>
          <div
            className="rounded-xl p-2.5 text-center"
            style={{
              background:
                sinStock > 0 ? "#fee2e2" : bajo > 0 ? "#fef9c3" : "#dcfce7",
            }}
          >
            <p
              className="text-lg font-extrabold"
              style={{
                color:
                  sinStock > 0 ? "#dc2626" : bajo > 0 ? "#a16207" : "#15803d",
              }}
            >
              {sinStock > 0 ? sinStock : bajo}
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-wide"
              style={{
                color:
                  sinStock > 0 ? "#dc2626" : bajo > 0 ? "#a16207" : "#15803d",
              }}
            >
              {sinStock > 0 ? "Sin stock" : bajo > 0 ? "Bajo" : "Ok"}
            </p>
          </div>
        </div>

        {/* Valor + flecha */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-[9px] font-bold uppercase tracking-wide mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Valor en stock
            </p>
            <p
              className="text-base font-extrabold"
              style={{ color: cat.color }}
            >
              {formatCOP(valor)}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5"
            style={{ background: cat.color + "18", color: cat.color }}
          >
            <FiArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
