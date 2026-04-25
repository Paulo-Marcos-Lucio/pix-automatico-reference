import { Link } from "react-router-dom";
import {
  CreditCard,
  FileSignature,
  Repeat,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCharges, useConsents, useSubscriptions } from "@/hooks/useApi";
import { formatDateTime, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function Dashboard() {
  const consents = useConsents(0, 100);
  const subscriptions = useSubscriptions(0, 100);
  const charges = useCharges(0, 50);

  const consentTotal = consents.data?.total ?? 0;
  const consentAuthorized =
    consents.data?.items.filter((c) => c.status === "AUTHORIZED").length ?? 0;
  const subscriptionTotal = subscriptions.data?.total ?? 0;
  const chargeTotal = charges.data?.total ?? 0;
  const chargesSettled = charges.data?.items.filter((c) => c.status === "SETTLED").length ?? 0;
  const chargesFailed = charges.data?.items.filter((c) => c.status === "FAILED").length ?? 0;
  const successRate =
    chargesSettled + chargesFailed > 0
      ? Math.round((chargesSettled / (chargesSettled + chargesFailed)) * 100)
      : null;

  const recentCharges = charges.data?.items.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão geral</h1>
        <p className="text-muted-foreground">
          Status operacional do Pix Automático em tempo real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={FileSignature}
          label="Consents"
          value={consents.isLoading ? null : consentTotal.toString()}
          hint={`${consentAuthorized} autorizados`}
          to="/consents"
        />
        <KpiCard
          icon={Repeat}
          label="Subscriptions"
          value={subscriptions.isLoading ? null : subscriptionTotal.toString()}
          hint="ativas"
          to="/subscriptions"
        />
        <KpiCard
          icon={CreditCard}
          label="Charges"
          value={charges.isLoading ? null : chargeTotal.toString()}
          hint={`${chargesSettled} liquidadas`}
          to="/charges"
        />
        <KpiCard
          icon={TrendingUp}
          label="Taxa de sucesso"
          value={successRate === null ? "—" : `${successRate}%`}
          hint={`${chargesFailed} falhas`}
          tone={successRate !== null && successRate < 80 ? "warning" : undefined}
          to="/charges"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Cobranças recentes
            </CardTitle>
            <Link to="/charges" className="text-xs text-muted-foreground hover:underline">
              ver tudo →
            </Link>
          </CardHeader>
          <CardContent>
            {charges.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentCharges.length === 0 ? (
              <EmptyHint message="Nenhuma cobrança ainda — crie um consent → subscription → charge." />
            ) : (
              <ul className="space-y-2">
                {recentCharges.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/charges/${c.id}`}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-2 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {shortId(c.id)}
                        </span>
                        <span className="text-sm">
                          {c.currency} {c.amount}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(c.initiatedAt ?? c.scheduledFor)}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Saúde da plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Idempotência" value={<Badge variant="success">3 camadas</Badge>} />
            <Row label="Outbox" value={<Badge variant="success">async Kafka</Badge>} />
            <Row label="Saga" value={<Badge variant="success">orquestrada</Badge>} />
            <Row label="Tracing" value={<Badge variant="secondary">OTel → Tempo</Badge>} />
            <Row label="Métricas" value={<Badge variant="secondary">Prometheus</Badge>} />
            <Row label="Logs" value={<Badge variant="secondary">JSON → Loki</Badge>} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  hint?: string;
  tone?: "warning";
  to: string;
}) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value === null ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
            )}
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div
            className={
              tone === "warning"
                ? "rounded-full bg-warning/10 p-3 text-warning"
                : "rounded-full bg-primary/10 p-3 text-primary"
            }
          >
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
