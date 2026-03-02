"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/gps", icon: "🗺️", label: "GPS" },
  { href: "/ask", icon: "💬", label: "Ask" },
  { href: "/builds", icon: "🔥", label: "Builds" },
  { href: "/squad", icon: "👥", label: "Squad" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-3 px-2"
      style={{ background: "rgba(6,13,26,0.97)", borderTop: "1px solid #1A2F50", backdropFilter: "blur(12px)" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 min-w-[52px] py-1 rounded-xl transition-all"
            style={{ opacity: active ? 1 : 0.5 }}
          >
            <span className="text-xl">{item.icon}</span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? "#2563EB" : "#7B9CC4" }}
            >
              {item.label}
            </span>
            {active && (
              <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#2563EB" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
