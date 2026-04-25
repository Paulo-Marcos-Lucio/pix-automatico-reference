import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Hash,
  Landmark,
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCharge } from "@/hooks/useApi";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export default function ChargeDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCharge(id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  }

  const isFailed = data.status === "FAILED";

  const steps = [
    {
      key: "SCHEDULED",
      label: "Agendada",
      hint: "Cobrança criada no sistema, aguardando a saga.",
      time: data.scheduledFor,
      done: true,
      active: data.status === "SCHEDULED",
      icon: Calendar,
    },
    {
      key: "INITIATED",
      label: "Iniciada no Banco Central",
      hint: "Saga chamou a API do BCB. Aguardando confirmação.",
      time: data.initiatedAt,
      done: !!data.initiatedAt,
      active: data.status === "INITIATED",
      icon: Clock,
    },
    {
      key: "SETTLED",
      label: isFailed ? "Falhou" : "Liquidada",
      hint: isFailed
        ? "Cobrança rejeitada pelo banco do pagador ou pelo BCB."
        : "Pagamento confirmado pelo BCB via webhook. Recursos transferidos.",
      time: data.settledAt,
      done: data.status === "SETTLED" || data.status === "FAILED",
      active: false,
      failed: isFailed,
      icon: isFailed ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/cobrancas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para cobranças
      </Link>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary-deep to-primary p-6 shadow-lg sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Cobrança
            </div>
            <h1 className="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
              {formatCurrency(data.amount, data.currency)}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={data.status} className="ring-white/20 backdrop-blur-sm" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => copy(data.id, "id")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-mono text-2xs text-white/90 transition-colors hover:bg-white/20"
                  >
                    {data.id}
                    {copiedKey === "id" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{copiedKey === "id" ? "Copiado!" : "Copiar ID"}</TooltipContent>
              </Tooltip>
              <span className="text-2xs text-white/70">
                Agendada para {formatDate(data.scheduledFor)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Clock className="h-4 w-4" />
            </div>
            Linha do tempo da saga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1">
            {steps.map((step, idx) => (
              <li key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-colors",
                      step.done && step.failed && "border-destructive bg-destructive/10 text-destructive",
                      step.done && !step.failed && "border-success bg-success/10 text-success",
                      !step.done && "border-border bg-muted/30 text-muted-foreground",
                      step.active && "ring-4 ring-primary/20",
                    )}
                  >
                    <step.icon className="h-4 w-4" strokeWidth={2.25} />
                    {step.active && (
                      <span className="absolute inset-0 animate-pulse rounded-xl ring-2 ring-primary/40" />
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "my-1 w-0.5 flex-1 min-h-[28px] rounded-full transition-colors",
                        step.done ? "bg-gradient-to-b from-success/60 to-success/20" : "bg-border",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    <span
                      className={cn(
                        "text-2xs tabular-nums",
                        step.done ? "text-muted-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {step.time
                        ? typeof step.time === "string" && step.time.length === 10
                          ? formatDate(step.time)
                          : formatDateTime(step.time)
                        : "Aguardando"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-2xs text-muted-foreground">{step.hint}</p>
                  {step.failed && data.errorCode && (
                    <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2 text-xs">
                      <span className="font-mono font-semibold text-destructive">{data.errorCode}</span>
                      <span className="text-destructive/80"> · {data.errorMessage}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <CreditCard className="h-4 w-4" />
              </div>
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Valor" value={
              <span className="text-base font-bold tabular-nums text-primary-deep">
                {formatCurrency(data.amount, data.currency)}
              </span>
            } />
            <Row
              label="Assinatura"
              value={
                <CopyableMono
                  value={data.subscriptionId}
                  copied={copiedKey === "sub"}
                  onCopy={() => copy(data.subscriptionId, "sub")}
                />
              }
            />
            <Row
              label="Consentimento"
              value={
                <CopyableMono
                  value={data.consentId}
                  copied={copiedKey === "cnst"}
                  onCopy={() => copy(data.consentId, "cnst")}
                />
              }
            />
            <Row
              label="Tentativas"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium",
                    data.attemptCount > 1
                      ? "bg-warning-soft text-warning"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Hash className="h-3 w-3" /> {data.attemptCount}
                </span>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info-soft text-info">
                <Landmark className="h-4 w-4" />
              </div>
              Banco Central · conciliação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="ID fim a fim"
              value={
                data.endToEndId ? (
                  <CopyableMono
                    value={data.endToEndId}
                    copied={copiedKey === "e2e"}
                    onCopy={() => copy(data.endToEndId!, "e2e")}
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
            <Row
              label="Iniciada em"
              value={data.initiatedAt ? formatDateTime(data.initiatedAt) : "—"}
            />
            <Row
              label="Liquidada em"
              value={data.settledAt ? formatDateTime(data.settledAt) : "—"}
            />
            {data.errorCode && (
              <>
                <Row label="Código do erro" value={<span className="font-mono">{data.errorCode}</span>} />
                <Row label="Mensagem" value={data.errorMessage ?? ""} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Educational footer */}
      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-2xs text-muted-foreground">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">Sobre essa cobrança</p>
          <p className="mt-1">
            Cada cobrança individual atravessa uma <strong>state machine</strong> com transições
            válidas. A saga orquestrada chama o BCB com circuit breaker, retry e bulkhead. O
            webhook de confirmação chega no endpoint{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono">
              POST /webhooks/bcb/charge-status
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function CopyableMono({
  value,
  copied,
  onCopy,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      onClick={onCopy}
      className="group inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-2xs transition-colors hover:bg-muted"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 opacity-40 group-hover:opacity-80" />
      )}
    </button>
  );
}
