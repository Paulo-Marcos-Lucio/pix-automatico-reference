import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const canAuthorize = data.status === "AWAITING_AUTHORIZATION";
  const canRevoke = data.status === "AUTHORIZED";

  return (
    <div className="space-y-6">
      <Link
        to="/consentimentos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        voltar
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Consentimento</h1>
            <StatusBadge status={data.status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{data.id}</p>
        </div>
        <div className="flex gap-2">
          {canAuthorize && (
            <Button onClick={handleAuthorize} disabled={authorize.isPending}>
              {authorize.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Autorizar
            </Button>
          )}
          {canRevoke && (
            <Button
              variant="destructive"
              onClick={() => setRevokeOpen(true)}
              disabled={revoke.isPending}
            >
              <XCircle />
              Revogar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pagador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Nome" value={data.payerName} />
            <Row label="Documento" value={maskDocument(data.payerDocument)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chave do recebedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tipo" value={pixKeyTypeLabel[data.receiverKeyType]} />
            <Row label="Valor" value={data.receiverKeyValue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recorrência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Frequência" value={frequencyLabel[data.frequency]} />
            <Row label="Valor" value={formatCurrency(data.amount, data.currency)} />
            <Row label="Início" value={formatDate(data.firstCharge)} />
            <Row label="Fim" value={data.endDate ? formatDate(data.endDate) : "—"} />
            <Row
              label="Máx. ocorrências"
              value={data.maxOccurrences?.toString() ?? "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
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
              <Row label="Motivo" value={data.revocationReason} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar consentimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
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
              Confirmar revogação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
