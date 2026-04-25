import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useConsents,
  useCreateSubscription,
  useSubscriptions,
} from "@/hooks/useApi";
import { formatDate, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";

export default function Subscriptions() {
  const { data, isLoading } = useSubscriptions();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground">
            Vínculos comerciais ativos sobre um consentimento autorizado.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Nova assinatura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data ? `${data.total} no total` : "Carregando..."}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificador</TableHead>
                <TableHead>Consentimento</TableHead>
                <TableHead>Referência interna</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Cobranças</TableHead>
                <TableHead>Última cobrança</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                        Nenhuma assinatura ainda. Crie a partir de um consentimento autorizado.
                      </TableCell>
                    </TableRow>
                  )
                  : data?.items.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{shortId(s.id)}</TableCell>
                        <TableCell>
                          <Link
                            to={`/consentimentos/${s.consentId}`}
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {shortId(s.consentId)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{s.externalReference ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell>{s.chargeCount}</TableCell>
                        <TableCell className="text-xs">
                          {s.lastChargeDate ? formatDate(s.lastChargeDate) : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(s.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateSubscriptionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function CreateSubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: consents } = useConsents(0, 100);
  const create = useCreateSubscription();
  const { toast } = useToast();
  const [consentId, setConsentId] = useState("");
  const [externalRef, setExternalRef] = useState("");

  const authorized = consents?.items.filter((c) => c.status === "AUTHORIZED") ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        consentId,
        externalReference: externalRef || null,
      });
      toast({ title: "Assinatura criada" });
      onOpenChange(false);
      setConsentId("");
      setExternalRef("");
    } catch (err) {
      toast({
        title: "Falha ao criar assinatura",
        description: err instanceof ApiError ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova assinatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Consentimento autorizado</Label>
            <Select value={consentId} onValueChange={setConsentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um consentimento..." />
              </SelectTrigger>
              <SelectContent>
                {authorized.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhum consentimento autorizado disponível
                  </div>
                ) : (
                  authorized.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {shortId(c.id)} — {c.payerName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Referência interna (opcional)</Label>
            <Input
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              placeholder="Ex.: fatura-2026-04-001"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!consentId || create.isPending}>
              {create.isPending && <Loader2 className="animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
