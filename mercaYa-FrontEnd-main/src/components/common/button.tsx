import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "success" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className = "",
}: Props) {
  const base = `
    inline-flex items-center gap-2 font-bold rounded-xl transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))',
      color: '#ffffff',
      boxShadow: 'var(--shadow-brand)',
    },
    success: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
    },
    danger: {
      backgroundColor: '#fff1f2',
      color: '#e11d48',
      border: '1px solid #fecdd3',
    },
    ghost: {
      backgroundColor: 'var(--surface-3)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant]}
    >
      {children}
    </button>
  );
}