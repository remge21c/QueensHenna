import { IconProps } from "@phosphor-icons/react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  variant?: "primary" | "secondary";
}

export default function KpiCard({ title, value, icon: Icon, variant = "primary" }: KpiCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg card-shadow border border-border flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex justify-between items-center text-muted text-sm font-medium">
        {title}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
          variant === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/20 text-[#B08D6A]"
        }`}>
          <Icon size={20} weight="regular" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}
