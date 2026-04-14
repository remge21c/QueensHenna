"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  SquaresFour,
  Users,
  CalendarCheck,
  ClipboardText,
  Drop,
  ChatCircleText,
  ChartLineUp,
  Gear,
  Plant,
  SignOut,
  List,
  X
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "대시보드", href: "/", icon: SquaresFour },
  { name: "고객관리", href: "/customers", icon: Users },
  { name: "예약관리", href: "/reservations", icon: CalendarCheck },
  { name: "시술기록", href: "/treatments", icon: ClipboardText },
  { name: "염색약관리", href: "/inventory", icon: Drop },
  { name: "문자발송", href: "/sms", icon: ChatCircleText },
  { name: "매출통계", href: "/sales", icon: ChartLineUp },
  { name: "설정 및 백업", href: "/settings", icon: Gear },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-2 mb-4 mt-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
          <Plant weight="fill" size={22} />
        </div>
        <div>
          <h1 className="text-lg font-black text-primary leading-none tracking-tight">Queens Henna</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Salon Management</p>
        </div>
      </div>

      <nav aria-label="주 메뉴" className="flex-1">
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 no-underline",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-surface-container hover:text-primary"
                  )}
                >
                  <Icon size={20} weight={isActive ? "fill" : "regular"} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-border space-y-3">
        <Link
          href="/reservations"
          onClick={() => setMobileOpen(false)}
          className="btn-primary w-full justify-center text-sm"
        >
          예약 등록
        </Link>
        <button
          aria-label="로그아웃"
          className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-error transition-colors w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SignOut size={18} aria-hidden="true" />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex md:hidden items-center justify-between glass border-b border-border/60 px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
            <Plant weight="fill" size={16} />
          </div>
          <span className="text-sm font-black text-primary">Queens Henna</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="p-2 rounded-lg text-foreground hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {mobileOpen ? <X size={24} weight="bold" aria-hidden="true" /> : <List size={24} weight="bold" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile spacer */}
      <div className="h-14 md:hidden shrink-0" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        aria-label="모바일 메뉴"
        className={cn(
          "fixed top-0 left-0 z-50 w-72 h-screen bg-surface border-r border-border p-6 flex flex-col gap-8 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="메뉴 닫기"
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={20} weight="bold" aria-hidden="true" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="w-[var(--sidebar-width)] bg-surface border-r border-border p-6 flex-col gap-8 hidden md:flex h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
