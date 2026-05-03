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
