"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { glass } from "@/src/lib/design/tokens";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  group: "menu" | "discover" | "settings";
};

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const NAV: NavItem[] = [
  // Menu
  {
    href: "/dashboard",
    label: "Dashboard",
    group: "menu",
    icon: <Icon d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" />,
  },
  {
    href: "/dashboard/progress",
    label: "Reading Progress",
    group: "menu",
    icon: <Icon d="M4 19V5m4 14V9m4 10v-6m4 6V7m4 12v-3" />,
  },
  {
    href: "/dashboard/collections",
    label: "Collections",
    group: "menu",
    icon: <Icon d="M4 6h16M4 12h16M4 18h16" />,
  },
  {
    href: "/dashboard/bookmarks",
    label: "Bookmarks",
    group: "menu",
    icon: <Icon d="M6 4h12v16l-6-4-6 4z" />,
  },
  {
    href: "/dashboard/notes",
    label: "Notes",
    group: "menu",
    icon: <Icon d="M5 4h11l3 3v13a1 1 0 01-1 1H5z M9 9h6 M9 13h6 M9 17h4" />,
  },
  {
    href: "/dashboard/tags",
    label: "Tags",
    group: "menu",
    icon: <Icon d="M4 4h7l9 9-7 7-9-9z M8 8v.01" />,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    group: "menu",
    icon: <Icon d="M4 19V9m6 10V5m6 14v-7" />,
  },
  // Discover
  {
    href: "/dashboard/explore",
    label: "Explore",
    group: "discover",
    icon: <Icon d="M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3a14 14 0 010 18 M12 3a14 14 0 000 18" />,
  },
  {
    href: "/dashboard/scholars",
    label: "Top Scholars",
    group: "discover",
    icon: <Icon d="M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0" />,
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    group: "discover",
    icon: <Icon d="M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v7H4z M13 14h7v7h-7z" />,
  },
  {
    href: "/dashboard/daily",
    label: "Daily Hadith",
    group: "discover",
    icon: <Icon d="M5 4h14v16H5z M5 9h14 M9 4v5 M15 4v5" />,
  },
  // Settings
  {
    href: "/dashboard/settings",
    label: "Settings",
    group: "settings",
    icon: <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6z M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 00-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002.1 1.2L10 21h4l.5-2.6a7 7 0 002.1-1.2l2.3.9 2-3.4-2-1.5A7 7 0 0019 12z" />,
  },
  {
    href: "/dashboard/help",
    label: "Help & Support",
    group: "settings",
    icon: <Icon d="M12 21a9 9 0 100-18 9 9 0 000 18z M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4 M12 17v.01" />,
  },
];

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[#4f72f8] to-[#3a5ce0] grid place-items-center shadow-sm">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 11V8a7 7 0 0114 0v3" />
          <path d="M3 11h18v9H3z" />
          <path d="M12 14v3" />
        </svg>
      </div>
      {!collapsed && (
        <span className="font-semibold tracking-tight text-[15px] text-ink">
          HadithHub
        </span>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/40 dark:text-white/40">
      {children}
    </p>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-[#eef2ff] text-[#3a5ce0] dark:bg-[#3a5ce0]/30 dark:text-[#a0baff] font-medium"
          : "text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const groups = [
    { id: "menu" as const, title: "Menu" },
    { id: "discover" as const, title: "Discover" },
    { id: "settings" as const, title: "Settings" },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          "transition-opacity",
        ].join(" ")}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={[
          "fixed md:sticky top-0 left-0 z-40 h-dvh md:h-screen shrink-0",
          collapsed ? "md:w-[78px]" : "md:w-[260px]",
          "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-[transform,width] duration-200",
          "bg-[var(--nav-bg)] backdrop-blur-xl",
          "border-r border-black/[0.06] dark:border-white/[0.06]",
          "flex flex-col",
        ].join(" ")}
        aria-label="Primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 pt-5 pb-4">
          <Logo collapsed={collapsed} />
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:grid h-8 w-8 place-items-center rounded-lg text-black/50 dark:text-white/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="md:hidden grid h-8 w-8 place-items-center rounded-lg text-black/50 dark:text-white/50 hover:bg-black/[0.04]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12 M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g.id}>
              {!collapsed && <GroupLabel>{g.title}</GroupLabel>}
              <ul className="flex flex-col gap-1">
                {NAV.filter((n) => n.group === g.id).map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      active={isActive(item.href)}
                      collapsed={collapsed}
                      onSelect={onMobileClose}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Upgrade card */}
        {!collapsed && (
          <div className="px-4 pb-5">
            <div
              className={[
                "rounded-2xl p-4",
                "bg-gradient-to-br from-[#4f72f8] via-[#5a4cd9] to-[#7c5ce6] text-white",
                glass.inset,
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l2.6 6.5H22l-5.4 4 2 6.5L12 15l-6.6 4 2-6.5L2 8.5h7.4z"/></svg>
                Upgrade to Pro
              </div>
              <p className="mt-1 text-xs text-white/70 leading-relaxed">
                Unlock advanced analytics, AI recommendations, and more.
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-xl bg-white text-[#3a5ce0] text-sm font-medium py-2 hover:bg-white/90 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
