"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#f7f8f9] dark:bg-[#0f1318] text-ink-900 dark:text-white">
      <div className="flex">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
