import type { ReactNode } from "react";
import { FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { useThemeStore } from "../../store/themeStore";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
}

export default function Topbar({ title, subtitle, actions, onMenuClick }: Props) {
  const { dark, toggle } = useThemeStore();

  return (
    <header
      className="flex items-center gap-3 px-4 md:px-6 py-3.5 sticky top-0 z-30 flex-shrink-0"
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-8 h-8 flex flex-col items-center justify-center rounded-lg transition"
        style={{ color: 'var(--text-secondary)' }}
      >
        <FiMenu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-base md:text-lg font-extrabold tracking-tight truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <button
          onClick={toggle}
          title="Cambiar tema"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{
            backgroundColor: 'var(--surface-3)',
            color: 'var(--text-secondary)',
          }}
        >
          {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>
      </div>
    </header>
  );
}