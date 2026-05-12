interface Props {
  label: string;
  id?: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Input({ label, id, type = "text", value, onChange, placeholder, required, disabled, className = "" }: Props) {
  return (
    <div className={className}>
      <label
        className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
        {required && <span className="ml-0.5" style={{ color: '#f87171' }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(59,91,219,0.2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; }}
        onBlur={(e)  => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}