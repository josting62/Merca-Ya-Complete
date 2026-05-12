import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "./store/authStore";
import AppLayout from "./components/layout/appLayout";

const LoginPage = lazy(() => import("./pages/loginPage"));
const DashboardPage = lazy(() => import("./pages/dashboardPage"));
const VentasPage = lazy(() => import("./pages/ventasPage"));
const ComprasPage = lazy(() => import("./pages/comprasPage"));
const InventarioPage = lazy(() => import("./pages/inventarioPage"));
const ClientesPage = lazy(() => import("./pages/clientePage"));
const CarteraPage = lazy(() => import("./pages/carteraPage"));
const ConfiguracionPage = lazy(() => import("./pages/configuracionPage"));
const PerfilPage = lazy(() => import("./pages/perfilPage"));
const DespachoPage = lazy(() => import("./pages/despachoPage"));
const UsuariosPage = lazy(() => import("./pages/usuariosPage"));
const CajaPage = lazy(() => import("./pages/cajaPage")); // ← nuevo

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function SplashScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--surface-2)" }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-light), var(--brand-dark))",
        }}
      >
        🛍️
      </div>
      <div
        className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

export default function App() {
  const { _hasHydrated } = useAuthStore();
  if (!_hasHydrated) return <SplashScreen />;

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ventas" element={<VentasPage />} />
            <Route path="compras" element={<ComprasPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cartera" element={<CarteraPage />} />
            <Route path="despachos" element={<DespachoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="caja" element={<CajaPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="perfil" element={<PerfilPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
