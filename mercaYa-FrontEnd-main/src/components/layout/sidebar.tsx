import { NavLink, useNavigate } from "react-router-dom";
import {
  FiTag,
  FiShoppingCart,
  FiTruck,
  FiPackage,
  FiUsers,
  FiBriefcase,
  FiSettings,
  FiLogOut,
  FiUser,
  FiUserCheck,
  FiShield,
  FiMonitor,
  FiGrid,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { usePermissions } from "../../hooks/usePermissions";

interface NavItem {
  to: string;
  icon: any;
  label: string;
  show: boolean;
}
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const perms = usePermissions();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NAV_SECTIONS = [
    {
      section: "Principal",
      items: [
        {
          to: "/dashboard",
          icon: FiGrid,
          label: "Dashboard",
          show: perms.verDashboard,
        },
        { to: "/caja", icon: FiMonitor, label: "Caja", show: perms.verCaja },
        { to: "/ventas", icon: FiTag, label: "Ventas", show: perms.verVentas },
        {
          to: "/compras",
          icon: FiShoppingCart,
          label: "Compras",
          show: perms.verCompras,
        },
        {
          to: "/despachos",
          icon: FiTruck,
          label: "Despachos",
          show: perms.verDespachos,
        },
      ] as NavItem[],
    },
    {
      section: "Gestión",
      items: [
        {
          to: "/inventario",
          icon: FiPackage,
          label: "Inventario",
          show: perms.verInventario,
        },
        {
          to: "/clientes",
          icon: FiUsers,
          label: "Clientes",
          show: perms.verClientes,
        },
        {
          to: "/cartera",
          icon: FiBriefcase,
          label: "Cartera",
          show: perms.verCartera,
        },
      ] as NavItem[],
    },
    {
      section: "Sistema",
      items: [
        {
          to: "/usuarios",
          icon: FiUserCheck,
          label: "Usuarios",
          show: perms.verUsuarios,
        },
        {
          to: "/configuracion",
          icon: FiSettings,
          label: "Configuración",
          show: true,
        },
      ] as NavItem[],
    },
  ];

  const ROL_BADGE = {
    admin: { bg: "var(--brand-subtle)", color: "var(--brand)", icon: FiShield },
    vendedor: { bg: "#dcfce7", color: "#15803d", icon: FiTag },
    bodega: { bg: "#fef9c3", color: "#a16207", icon: FiPackage },
    cajera: { bg: "#f3e8ff", color: "#7c3aed", icon: FiMonitor },
  } as const;

  const rol = (user?.rol as keyof typeof ROL_BADGE) || "vendedor";
  const badge = ROL_BADGE[rol] ?? ROL_BADGE.vendedor;
  const BadgeIcon = badge.icon;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          width: "224px",
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            <FiShoppingCart size={16} color="#fff" />
          </div>
          <div>
            <p
              className="text-sm font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              MercaYa
            </p>
            <p
              className="text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Sistema POS
            </p>
          </div>
        </div>

        {/* Nav dinámico */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV_SECTIONS.map((section) => {
            const visibles = section.items.filter((i) => i.show);
            if (visibles.length === 0) return null;
            return (
              <div key={section.section}>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest px-2 pt-5 pb-2 first:pt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {section.section}
                </p>
                {visibles.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5"
                      style={({ isActive }) =>
                        isActive
                          ? {
                              backgroundColor: "var(--brand-subtle)",
                              color: "var(--brand)",
                              fontWeight: 700,
                            }
                          : { color: "var(--text-secondary)" }
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                            style={
                              isActive
                                ? {
                                    backgroundColor: "var(--brand)",
                                    color: "#fff",
                                  }
                                : {
                                    backgroundColor: "var(--surface-3)",
                                    color: "var(--text-secondary)",
                                  }
                            }
                          >
                            <Icon size={14} />
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User pill */}
        <div
          className="px-3 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="px-3 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              <BadgeIcon size={9} />
              {rol.charAt(0).toUpperCase() + rol.slice(1)}
            </span>
          </div>

          <div
            onClick={() => {
              navigate("/perfil");
              onClose();
            }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-[var(--surface-3)]"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
              }}
            >
              {user?.nombre?.slice(0, 2).toUpperCase() || "JR"}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-bold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.nombre || "Usuario"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {user?.email || ""}
              </p>
            </div>
            <FiUser size={13} style={{ color: "var(--text-muted)" }} />
          </div>

          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all hover:bg-red-50 hover:text-red-500"
            style={{ color: "var(--text-muted)" }}
          >
            <FiLogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
