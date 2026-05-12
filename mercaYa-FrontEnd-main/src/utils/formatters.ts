const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function formatCOP(value: number | string | null | undefined): string {
  const n = Number(value) || 0;
  return "$" + n.toLocaleString("es-CO");
}

// Acepta: "2026-04-29", Date, ISO string "2026-04-29T05:00:00.000Z", null
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  try {
    // Si es string tipo YYYY-MM-DD, parsear directamente sin timezone
    if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      return `${d} ${MESES[+m - 1]} ${y}`;
    }
    // Si es ISO string o Date, convertir con UTC para evitar desfase de zona horaria
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = MESES[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "—";
  }
}

export function formatDateLong(): string {
  const now = new Date();
  return `${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]} ${now.getFullYear()}`;
}

export function greetingByHour(): string {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}
