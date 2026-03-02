"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⌂", label: "HOME" },
  { href: "/gps", icon: "◎", label: "GPS" },
  { href: "/ask", icon: "◈", label: "ASK" },
  { href: "/builds", icon: "▲", label: "BUILDS" },
  { href: "/squad", icon: "◉", label: "SQUAD" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-3 px-4"
      style={{
        background: "rgba(8,8,8,0.97)",
        borderTop: "1px solid #242424",
        backdropFilter: "blur(16px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-[52px] py-1 relative transition-all"
          >
            <span
              className="text-base font-display font-bold leading-none transition-colors"
              style={{ color: active ? "#FF6B2B" : "#3A3530" }}
            >
              {item.icon}
            </span>
            <span
              className="font-mono text-[9px] font-medium tracking-[0.14em] transition-colors"
              style={{ color: active ? "#FF6B2B" : "#3A3530" }}
            >
              {item.label}
            </span>
            {active && (
              <span
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-[2px]"
                style={{ background: "#FF6B2B" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
