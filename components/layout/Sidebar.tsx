"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SignOut
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

  return (
    <aside className="w-[var(--sidebar-width)] bg-surface border-r border-border p-6 flex-col gap-8 hidden md:flex h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2 mb-4 mt-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
          <Plant weight="fill" size={22} />
        </div>
        <div>
          <h1 className="text-lg font-black text-primary leading-none tracking-tight">Queens Henna</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Salon Management</p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
          className="btn-primary w-full justify-center text-sm"
        >
          예약 등록
        </Link>
        <button className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-error transition-colors w-full rounded-lg">
          <SignOut size={18} />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
