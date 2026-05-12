import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "././sidebar";
import { useSocketInit } from "../../hooks/useSocketInit";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSocketInit();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
}