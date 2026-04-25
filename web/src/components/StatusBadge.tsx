import { Badge } from "@/components/ui/badge";
import type { ChargeStatus, ConsentStatus, SubscriptionStatus } from "@/lib/types";

type Status = ChargeStatus | ConsentStatus | SubscriptionStatus;

const variantByStatus: Record<Status, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  // Charge
  SCHEDULED: "secondary",
  INITIATED: "warning",
  SETTLED: "success",
  FAILED: "destructive",
  CANCELLED: "outline",
  // Consent
  AWAITING_AUTHORIZATION: "warning",
  AUTHORIZED: "success",
  REJECTED: "destructive",
  REVOKED: "outline",
  EXPIRED: "outline",
  CONSUMED: "secondary",
  // Subscription
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "secondary",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={variantByStatus[status] ?? "secondary"} className="font-mono text-xs">
      {status}
    </Badge>
  );
}
