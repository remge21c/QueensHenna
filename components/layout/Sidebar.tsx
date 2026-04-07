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
  Plant
} from "@phosphor-icons/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <aside className="w-[280px] bg-surface border-right border-border p-6 flex flex-col gap-8 hidden md:flex h-screen sticky top-0">
      <div className="flex justify-between items-center mb-4">
        <div className="logo text-2xl font-bold color-primary flex items-center gap-3 tracking-tighter whitespace-nowrap">
          <Plant weight="fill" className="text-primary" />
          <span className="text-primary">Queens Henna</span>
        </div>
      </div>

      <nav>
        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-md font-medium transition-all duration-300 no-underline",
                    isActive 
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(90,113,99,0.3)]" 
                      : "text-muted hover:bg-background hover:text-primary hover:translate-x-1"
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
    </aside>
  );
}
