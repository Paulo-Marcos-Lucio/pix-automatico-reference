import { Badge } from "@/components/ui/badge";
import type { ChargeStatus, ConsentStatus, SubscriptionStatus } from "@/lib/types";
import { statusLabel } from "@/lib/i18n";

type Status = ChargeStatus | ConsentStatus | SubscriptionStatus;

const variantByStatus: Record<Status, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  // Cobrança
  SCHEDULED: "secondary",
  INITIATED: "warning",
  SETTLED: "success",
  FAILED: "destructive",
  CANCELLED: "outline",
  // Consentimento
  AWAITING_AUTHORIZATION: "warning",
  AUTHORIZED: "success",
  REJECTED: "destructive",
  REVOKED: "outline",
  EXPIRED: "outline",
  CONSUMED: "secondary",
  // Assinatura
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "secondary",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={variantByStatus[status] ?? "secondary"} className="text-xs">
      {statusLabel(status)}
    </Badge>
  );
}
