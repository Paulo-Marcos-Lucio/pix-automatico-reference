import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCharge } from "@/hooks/useApi";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export default function ChargeDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCharge(id);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const steps = [
    {
      key: "SCHEDULED",
      label: "Agendada",
      time: data.scheduledFor,
      done: true,
      icon: Calendar,
    },
    {
      key: "INITIATED",
      label: "Iniciada no BCB",
      time: data.initiatedAt,
      done: !!data.initiatedAt,
      icon: Clock,
    },
    {
      key: "SETTLED",
      label: data.status === "FAILED" ? "Falhou" : "Liquidada",
      time: data.settledAt,
      done: data.status === "SETTLED" || data.status === "FAILED",
      failed: data.status === "FAILED",
      icon: data.status === "FAILED" ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/charges"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        voltar
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Cobrança</h1>
          <StatusBadge status={data.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{data.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2",
                      step.done && step.failed && "border-destructive bg-destructive/10 text-destructive",
                      step.done && !step.failed && "border-success bg-success/10 text-success",
                      !step.done && "border-muted bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "mt-1 w-0.5 flex-1",
                        step.done ? "bg-primary/40" : "bg-muted",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.time
                      ? typeof step.time === "string" && step.time.length === 10
                        ? formatDate(step.time)
                        : formatDateTime(step.time)
                      : "—"}
                  </p>
                  {step.failed && data.errorCode && (
                    <p className="mt-1 text-sm text-destructive">
                      <span className="font-mono">{data.errorCode}</span>: {data.errorMessage}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Valor" value={formatCurrency(data.amount, data.currency)} />
            <Row label="Subscription" value={data.subscriptionId} mono />
            <Row label="Consent" value={data.consentId} mono />
            <Row label="Tentativas" value={data.attemptCount.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BCB / Conciliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="EndToEndId" value={data.endToEndId ?? "—"} mono />
            <Row
              label="Iniciada"
              value={data.initiatedAt ? formatDateTime(data.initiatedAt) : "—"}
            />
            <Row
              label="Liquidada"
              value={data.settledAt ? formatDateTime(data.settledAt) : "—"}
            />
            {data.errorCode && (
              <>
                <Row label="Código de erro" value={data.errorCode} mono />
                <Row label="Mensagem" value={data.errorMessage ?? ""} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right break-all", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}
