interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  required?: boolean;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  required,
  className = "",
}: Props) {
  return (
    <div className={className}>
      <label
        className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {required && (
          <span className="ml-0.5" style={{ color: "#f87171" }}>
            *
          </span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
        style={{
          backgroundColor: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 3px rgba(59,91,219,0.2)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        <option value="">— Seleccionar —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
