import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

type WarrantyStatus = "valid" | "expiring" | "expired";

interface WarrantyStatusBadgeProps {
  status: WarrantyStatus;
  daysRemaining?: number;
}

export function WarrantyStatusBadge({ status, daysRemaining }: WarrantyStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          label: "Garantia Válida",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      case "expiring":
        return {
          label: "Expira em Breve",
          icon: AlertCircle,
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        };
      case "expired":
        return {
          label: "Garantia Expirada",
          icon: XCircle,
          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs font-semibold`} data-testid={`badge-warranty-${status}`}>
      <Icon className="h-3 w-3" />
      {config.label}
      {daysRemaining !== undefined && status !== "expired" && (
        <span className="ml-1">({daysRemaining}d)</span>
      )}
    </Badge>
  );
}
