import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthorizeConsent, useConsent, useRevokeConsent } from "@/hooks/useApi";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  maskDocument,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { frequencyLabel, pixKeyTypeLabel } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ConsentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useConsent(id);
  const authorize = useAuthorizeConsent();
  const revoke = useRevokeConsent();
  const { toast } = useToast();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleAuthorize() {
    if (!id) return;
    try {
      await authorize.mutateAsync(id);
      toast({ title: "Consentimento autorizado" });
    } catch (err) {
      toast({
        title: "Falha ao autorizar",
        description: err instanceof ApiError ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  async function handleRevoke() {
    if (!id) return;
    try {
      await revoke.mutateAsync({ id, reason: revokeReason });
      toast({ title: "Consentimento revogado" });
      setRevokeOpen(false);
      setRevokeReason("");
    } catch (err) {
      toast({
        title: "Falha ao revogar",
        description: err instanceof ApiError ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  function copyId() {
    if (!data) return;
    navigator.clipboard.writeText(data.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const canAuthorize = data.status === "AWAITING_AUTHORIZATION";
  const canRevoke = data.status === "AUTHORIZED";

  return (
    <div className="space-y-6">
      <Link
        to="/consentimentos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para consentimentos
      </Link>

      {/* Hero header com gradient */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary-deep to-primary p-6 shadow-lg sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-white backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Consentimento
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {data.payerName}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                status={data.status}
                className="ring-white/20 backdrop-blur-sm"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyId}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-mono text-2xs text-white/90 transition-colors hover:bg-white/20"
                  >
                    {data.id}
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copiado!" : "Copiar"}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {(canAuthorize || canRevoke) && (
            <div className="flex gap-2">
              {canAuthorize && (
                <Button
                  variant="solid"
                  size="lg"
                  onClick={handleAuthorize}
                  disabled={authorize.isPending}
                  className="bg-white text-primary-deep hover:bg-white/90"
                >
                  {authorize.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Autorizar
                </Button>
              )}
              {canRevoke && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setRevokeOpen(true)}
                  disabled={revoke.isPending}
                  className="border border-white/30 bg-white/5 text-white hover:bg-white/15"
                >
                  <XCircle className="h-4 w-4" />
                  Revogar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard icon={User} title="Pagador">
          <Row label="Nome" value={<span className="font-medium">{data.payerName}</span>} />
          <Row label="Documento" value={<span className="font-mono">{maskDocument(data.payerDocument)}</span>} />
        </DetailCard>

        <DetailCard icon={KeyRound} title="Chave Pix do recebedor">
          <Row label="Tipo" value={<span className="font-medium">{pixKeyTypeLabel[data.receiverKeyType]}</span>} />
          <Row label="Valor" value={<span className="break-all font-mono text-xs">{data.receiverKeyValue}</span>} />
        </DetailCard>

        <DetailCard icon={CalendarRange} title="Regra de recorrência">
          <Row label="Frequência" value={<span className="font-medium">{frequencyLabel[data.frequency]}</span>} />
          <Row
            label="Valor"
            value={<span className="text-base font-bold tabular-nums text-primary-deep">{formatCurrency(data.amount, data.currency)}</span>}
          />
          <Row label="Início" value={formatDate(data.firstCharge)} />
          <Row label="Fim" value={data.endDate ? formatDate(data.endDate) : "—"} />
          <Row
            label="Máx. ocorrências"
            value={data.maxOccurrences ? `${data.maxOccurrences}×` : "—"}
          />
        </DetailCard>

        <DetailCard icon={ShieldCheck} title="Trilha de auditoria">
          <Row label="Criado em" value={formatDateTime(data.createdAt)} />
          <Row
            label="Autorizado em"
            value={data.authorizedAt ? formatDateTime(data.authorizedAt) : "—"}
          />
          <Row
            label="Revogado em"
            value={data.revokedAt ? formatDateTime(data.revokedAt) : "—"}
          />
          {data.revocationReason && (
            <div className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-2xs text-warning-foreground">
              <span className="font-semibold">Motivo da revogação:</span> {data.revocationReason}
            </div>
          )}
        </DetailCard>
      </div>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar consentimento</DialogTitle>
            <DialogDescription>
              Após revogado, este consentimento <strong>não pode</strong> mais autorizar novas
              cobranças. A operação é irreversível e ficará registrada na trilha de auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo (obrigatório)</Label>
            <Input
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Ex.: solicitação do cliente"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!revokeReason || revoke.isPending}
              onClick={handleRevoke}
            >
              {revoke.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar revogação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}
