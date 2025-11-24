import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({ title, value, icon: Icon, variant = "default" }: StatsCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-green-600 dark:text-green-500",
    warning: "text-amber-600 dark:text-amber-500",
    danger: "text-red-600 dark:text-red-500",
  };

  return (
    <Card className="p-6" data-testid={`stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-muted ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
