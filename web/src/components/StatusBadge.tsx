import { cn } from "@/lib/utils";
import type { ChargeStatus, ConsentStatus, SubscriptionStatus } from "@/lib/types";
import { statusLabel } from "@/lib/i18n";

type Status = ChargeStatus | ConsentStatus | SubscriptionStatus;

const styleByStatus: Record<Status, { dot: string; pill: string }> = {
  // Cobrança
  SCHEDULED:    { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-700 ring-slate-200" },
  INITIATED:    { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  SETTLED:      { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  FAILED:       { dot: "bg-red-500",     pill: "bg-red-50 text-red-700 ring-red-200" },
  CANCELLED:    { dot: "bg-zinc-400",    pill: "bg-zinc-50 text-zinc-600 ring-zinc-200" },
  // Consentimento
  AWAITING_AUTHORIZATION: { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  AUTHORIZED:             { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  REJECTED:               { dot: "bg-red-500",     pill: "bg-red-50 text-red-700 ring-red-200" },
  REVOKED:                { dot: "bg-zinc-400",    pill: "bg-zinc-50 text-zinc-600 ring-zinc-200" },
  EXPIRED:                { dot: "bg-zinc-400",    pill: "bg-zinc-50 text-zinc-600 ring-zinc-200" },
  CONSUMED:               { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-700 ring-slate-200" },
  // Assinatura
  ACTIVE:    { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  PAUSED:    { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 ring-amber-200" },
  COMPLETED: { dot: "bg-slate-400",   pill: "bg-slate-50 text-slate-700 ring-slate-200" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = styleByStatus[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s?.pill ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s?.dot ?? "bg-foreground/40")} />
      {statusLabel(status)}
    </span>
  );
}
