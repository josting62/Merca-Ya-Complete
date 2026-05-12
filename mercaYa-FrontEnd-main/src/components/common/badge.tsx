import { FiCheck } from "react-icons/fi";

interface BadgePagoProps  { estado: string; }
interface BadgeStockProps { stock: number; stockMin: number; }

/* ── Pago ── */
type BadgeStyle = { bg: string; color: string };

const PAGO_STYLES: Record<string, BadgeStyle> = {
  pagado:     { bg: '#dcfce7', color: '#15803d' },
  parcial:    { bg: '#fef9c3', color: '#a16207' },
  'no-pagado':{ bg: '#fee2e2', color: '#dc2626' },
};

const PAGO_LABELS: Record<string, string> = {
  pagado:     'Pagado',
  parcial:    'Parcial',
  'no-pagado':'No pagado',
};

/* ── Estado entrega ── */
const ESTADO_STYLES: Record<string, BadgeStyle> = {
  completado: { bg: '#dcfce7', color: '#15803d' },
  transito:   { bg: 'var(--brand-subtle)', color: 'var(--brand)' },
  pendiente:  { bg: '#fef9c3', color: '#a16207' },
  cancelado:  { bg: '#fee2e2', color: '#dc2626' },
};

const ESTADO_LABELS: Record<string, string> = {
  completado: 'Completado',
  transito:   'En tránsito',
  pendiente:  'Pendiente',
  cancelado:  'Cancelado',
};

const DEFAULT_STYLE: BadgeStyle = { bg: 'var(--surface-3)', color: 'var(--text-muted)' };

export function BadgePago({ estado }: BadgePagoProps) {
  const s = PAGO_STYLES[estado] || DEFAULT_STYLE;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {estado === 'pagado' && <FiCheck size={10} />}
      {PAGO_LABELS[estado] || estado}
    </span>
  );
}

export function BadgeEstado({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] || DEFAULT_STYLE;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

export function BadgeStock({ stock, stockMin }: BadgeStockProps) {
  if (stock === 0)
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
      >
        Sin stock
      </span>
    );
  if (stock <= stockMin)
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
        style={{ backgroundColor: '#fef9c3', color: '#a16207' }}
      >
        Stock bajo
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
    >
      <FiCheck size={10} /> En stock
    </span>
  );
}