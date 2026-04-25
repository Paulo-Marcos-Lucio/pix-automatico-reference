import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useConsents,
  useCreateSubscription,
  useSubscriptions,
} from "@/hooks/useApi";
import { formatDate, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import type { SubscriptionStatus } from "@/lib/types";

const filterTabs: { value: "ALL" | SubscriptionStatus; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Ativas" },
  { value: "PAUSED", label: "Pausadas" },
  { value: "COMPLETED", label: "Concluídas" },
  { value: "CANCELLED", label: "Canceladas" },
];

export default function Subscriptions() {
  const { data, isLoading } = useSubscriptions(0, 100);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | SubscriptionStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let items = data?.items ?? [];
    if (filter !== "ALL") items = items.filter((s) => s.status === filter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.consentId.toLowerCase().includes(q) ||
          (s.externalReference ?? "").toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, filter, search]);

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    return {
      ALL: items.length,
      ACTIVE: items.filter((s) => s.status === "ACTIVE").length,
      PAUSED: items.filter((s) => s.status === "PAUSED").length,
      COMPLETED: items.filter((s) => s.status === "COMPLETED").length,
      CANCELLED: items.filter((s) => s.status === "CANCELLED").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vínculos comerciais"
        title="Assinaturas"
        description="Cada assinatura amarra um consentimento autorizado a um produto ou plano da sua plataforma."
        actions={
          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus />
            Nova assinatura
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            {filterTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                {t.label}
                <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-muted px-1 text-2xs text-muted-foreground data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {counts[t.value as keyof typeof counts] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="w-64">
          <SearchInput
            placeholder="Buscar por ID, referência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Repeat}
                title={
                  search || filter !== "ALL"
                    ? "Nenhuma assinatura corresponde ao filtro"
                    : "Nenhuma assinatura ainda"
                }
                description={
                  search || filter !== "ALL"
                    ? "Tente ajustar a busca ou trocar o filtro de situação."
                    : "Após autorizar um consentimento, vincule-o a um plano comercial."
                }
                action={
                  !search && filter === "ALL" ? (
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4" /> Nova assinatura
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Consentimento</TableHead>
                  <TableHead>Referência interna</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Cobranças</TableHead>
                  <TableHead>Última cobrança</TableHead>
                  <TableHead>Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="group">
                    <TableCell className="font-mono text-2xs text-muted-foreground">
                      {shortId(s.id)}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/consentimentos/${s.consentId}`}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-soft/40 px-2 py-0.5 font-mono text-2xs text-primary-deep transition-colors hover:bg-primary-soft"
                      >
                        {shortId(s.consentId)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.externalReference ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {s.chargeCount}
                    </TableCell>
                    <TableCell className="text-2xs">
                      {s.lastChargeDate ? formatDate(s.lastChargeDate) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-2xs text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-2xs text-muted-foreground">
          <span>
            Exibindo <strong className="text-foreground">{filtered.length}</strong> de{" "}
            <strong className="text-foreground">{data?.total ?? 0}</strong> assinaturas
          </span>
        </div>
      )}

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
          <DialogDescription>
            Vincula um consentimento autorizado a um plano comercial. Cobranças posteriores
            referenciam essa assinatura.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Consentimento autorizado</Label>
            <Select value={consentId} onValueChange={setConsentId}>
              <SelectTrigger className="h-10">
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
            <p className="text-2xs text-muted-foreground">
              Identificador interno do seu sistema pra reconciliar com sua contabilidade.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!consentId || create.isPending}>
              {create.isPending && <Loader2 className="animate-spin" />}
              Criar assinatura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
