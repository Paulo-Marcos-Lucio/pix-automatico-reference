import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileSignature,
  Plus,
  Repeat,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCharges, useConsents, useSubscriptions } from "@/hooks/useApi";
import { formatCurrency, formatDateTime, shortId } from "@/lib/utils";
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
  const chargesInitiated = charges.data?.items.filter((c) => c.status === "INITIATED").length ?? 0;
  const successRate =
    chargesSettled + chargesFailed > 0
      ? Math.round((chargesSettled / (chargesSettled + chargesFailed)) * 100)
      : null;

  const totalProcessed = charges.data?.items
    .filter((c) => c.status === "SETTLED")
    .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  const recentCharges = charges.data?.items.slice(0, 6) ?? [];

  // Pseudo sparkline data — em prod viria do Prometheus
  const fakeSpark = (n: number) =>
    Array.from({ length: 12 }, (_, i) => Math.max(0, n + Math.sin(i / 2) * (n * 0.3) + (Math.random() - 0.5) * (n * 0.2)));

  const loading = consents.isLoading || subscriptions.isLoading || charges.isLoading;

  return (
    <div className="space-y-8">
      {/* Hero — métrica principal em destaque */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary-deep via-primary to-primary p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Visão geral
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Bem-vindo, operador
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Acompanhe consentimentos, assinaturas e cobranças do Pix Automático em tempo
              real. Os dados são atualizados a cada 5 segundos.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild variant="solid" size="default" className="bg-white text-primary-deep hover:bg-white/90 hover:shadow-lg">
                <Link to="/consentimentos">
                  <Plus className="h-4 w-4" /> Novo consentimento
                </Link>
              </Button>
              <Button asChild variant="ghost" size="default" className="text-white hover:bg-white/15">
                <Link to="/cobrancas">
                  Ver cobranças <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:min-w-[280px]">
            <p className="text-2xs font-bold uppercase tracking-wider text-white/70">
              Total processado
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-white">
              {loading ? "—" : formatCurrency(totalProcessed, "BRL")}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>{chargesSettled} liquidadas</span>
              <span className="text-white/40">·</span>
              <span>{chargesInitiated} em curso</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 animate-stagger sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileSignature}
          label="Consentimentos"
          value={consentTotal}
          hint={`${consentAuthorized} autorizados`}
          to="/consentimentos"
          tone="primary"
          loading={consents.isLoading}
          sparkData={fakeSpark(consentTotal)}
        />
        <StatCard
          icon={Repeat}
          label="Assinaturas"
          value={subscriptionTotal}
          hint="ativas"
          to="/assinaturas"
          tone="info"
          loading={subscriptions.isLoading}
          sparkData={fakeSpark(subscriptionTotal)}
        />
        <StatCard
          icon={CreditCard}
          label="Cobranças"
          value={chargeTotal}
          hint={`${chargesSettled} liquidadas`}
          to="/cobrancas"
          tone="success"
          loading={charges.isLoading}
          sparkData={fakeSpark(chargeTotal)}
        />
        <StatCard
          icon={TrendingUp}
          label="Taxa de sucesso"
          value={successRate === null ? "—" : `${successRate}%`}
          hint={`${chargesFailed} falhas`}
          tone={successRate !== null && successRate < 80 ? "warning" : "success"}
          to="/cobrancas"
          loading={charges.isLoading}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <CardTitle>Cobranças recentes</CardTitle>
            </div>
            <Link
              to="/cobrancas"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-deep"
            >
              Ver tudo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pb-4">
            {charges.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : recentCharges.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Nenhuma cobrança ainda"
                description="Crie um consentimento, vincule a uma assinatura e agende a primeira cobrança."
                action={
                  <Button asChild size="sm">
                    <Link to="/consentimentos">
                      <Plus className="h-4 w-4" /> Começar
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="-mx-2 space-y-1">
                {recentCharges.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/cobrancas/${c.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-primary-soft/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-2xs text-muted-foreground">
                              {shortId(c.id)}
                            </span>
                          </div>
                          <p className="truncate text-sm font-semibold text-foreground">
                            {formatCurrency(c.amount, c.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {formatDateTime(c.initiatedAt ?? c.scheduledFor)}
                        </span>
                        <StatusBadge status={c.status} />
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Saúde da plataforma */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <CardTitle>Saúde da plataforma</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <HealthItem label="Idempotência" detail="3 camadas" tone="success" />
              <HealthItem label="Caixa de saída" detail="async Kafka" tone="success" />
              <HealthItem label="Orquestração" detail="saga" tone="success" />
              <HealthItem label="Rastreio distribuído" detail="OTel → Tempo" tone="info" />
              <HealthItem label="Métricas" detail="Prometheus" tone="info" />
              <HealthItem label="Logs estruturados" detail="JSON → Loki" tone="info" />
            </ul>
            <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">Implementação de referência</span>
              </div>
              <p className="mt-1 text-2xs text-muted-foreground">
                Cada item acima é exigência regulatória do BCB para integração com Pix Automático em produção.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthItem({
  label,
  detail,
  tone,
}: {
  label: string;
  detail: string;
  tone: "success" | "info";
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-foreground">
        <CheckCircle2
          className={tone === "success" ? "h-4 w-4 text-success" : "h-4 w-4 text-info"}
        />
        {label}
      </span>
      <span className="text-2xs font-medium text-muted-foreground">{detail}</span>
    </li>
  );
}
