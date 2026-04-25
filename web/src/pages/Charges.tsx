import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CreditCard, Loader2, Plus, RefreshCw } from "lucide-react";
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
  useCharges,
  useScheduleCharge,
  useSubscriptions,
} from "@/hooks/useApi";
import { formatCurrency, formatDate, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import type { ChargeStatus } from "@/lib/types";

const filterTabs: { value: "ALL" | ChargeStatus; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "SCHEDULED", label: "Agendadas" },
  { value: "INITIATED", label: "Iniciadas" },
  { value: "SETTLED", label: "Liquidadas" },
  { value: "FAILED", label: "Falharam" },
];

export default function Charges() {
  const { data, isLoading, isFetching } = useCharges(0, 100);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | ChargeStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let items = data?.items ?? [];
    if (filter !== "ALL") items = items.filter((c) => c.status === filter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.subscriptionId.toLowerCase().includes(q) ||
          (c.endToEndId ?? "").toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, filter, search]);

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    return {
      ALL: items.length,
      SCHEDULED: items.filter((c) => c.status === "SCHEDULED").length,
      INITIATED: items.filter((c) => c.status === "INITIATED").length,
      SETTLED: items.filter((c) => c.status === "SETTLED").length,
      FAILED: items.filter((c) => c.status === "FAILED").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transações"
        title="Cobranças"
        description="Cada cobrança individual percorre o fluxo agendada → iniciada → liquidada. A página atualiza automaticamente a cada 5 segundos."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-2xs font-medium text-success sm:inline-flex">
              <RefreshCw className={isFetching ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
              Ao vivo
            </div>
            <Button onClick={() => setCreateOpen(true)} size="lg">
              <Plus />
              Agendar cobrança
            </Button>
          </div>
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
            placeholder="Buscar por ID, assinatura, E2E..."
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
                icon={CreditCard}
                title={
                  search || filter !== "ALL"
                    ? "Nenhuma cobrança corresponde ao filtro"
                    : "Nenhuma cobrança ainda"
                }
                description={
                  search || filter !== "ALL"
                    ? "Tente ajustar a busca ou trocar o filtro de situação."
                    : "Agende a primeira cobrança a partir de uma assinatura ativa."
                }
                action={
                  !search && filter === "ALL" ? (
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4" /> Agendar cobrança
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
                  <TableHead>Assinatura</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Agendada para</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>ID fim a fim</TableHead>
                  <TableHead className="text-right">Tentativas</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="group cursor-pointer">
                    <TableCell className="font-mono text-2xs text-muted-foreground">
                      <Link to={`/cobrancas/${c.id}`}>{shortId(c.id)}</Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/assinaturas"
                        className="inline-flex items-center gap-1 rounded-md bg-primary-soft/40 px-2 py-0.5 font-mono text-2xs text-primary-deep transition-colors hover:bg-primary-soft"
                      >
                        {shortId(c.subscriptionId)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      <Link to={`/cobrancas/${c.id}`}>
                        {formatCurrency(c.amount, c.currency)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/cobrancas/${c.id}`} className="text-2xs">
                        {formatDate(c.scheduledFor)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/cobrancas/${c.id}`}>
                        <StatusBadge status={c.status} />
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-2xs text-muted-foreground">
                      {c.endToEndId ? c.endToEndId.slice(0, 18) + "…" : <span>—</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-2xs">
                      {c.attemptCount}
                    </TableCell>
                    <TableCell>
                      <Link to={`/cobrancas/${c.id}`} className="flex justify-end">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
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
            <strong className="text-foreground">{data?.total ?? 0}</strong> cobranças
          </span>
          <span>Atualização automática a cada 5s</span>
        </div>
      )}

      <ScheduleChargeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function ScheduleChargeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: subs } = useSubscriptions(0, 100);
  const schedule = useScheduleCharge();
  const { toast } = useToast();
  const [subscriptionId, setSubscriptionId] = useState("");
  const [amount, setAmount] = useState("99.90");
  const [scheduledFor, setScheduledFor] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const active = subs?.items.filter((s) => s.status === "ACTIVE") ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await schedule.mutateAsync({
        subscriptionId,
        amount,
        currency: "BRL",
        scheduledFor,
      });
      toast({
        title: "Cobrança agendada",
        description: "A orquestração assíncrona vai iniciá-la em segundos.",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Falha ao agendar",
        description: err instanceof ApiError ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar cobrança</DialogTitle>
          <DialogDescription>
            A cobrança nasce em <strong>"Agendada"</strong>. A saga vai chamar o BCB em segundos
            e transitá-la pra <strong>"Iniciada"</strong>. Quando o webhook de liquidação chegar,
            vai pra <strong>"Liquidada"</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Assinatura ativa</Label>
            <Select value={subscriptionId} onValueChange={setSubscriptionId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {active.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhuma assinatura ativa
                  </div>
                ) : (
                  active.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {shortId(s.id)} {s.externalReference ? `· ${s.externalReference}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor (R$)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-2xs font-medium text-muted-foreground">
                  R$
                </span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  required
                  className="pl-9 tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!subscriptionId || schedule.isPending}>
              {schedule.isPending && <Loader2 className="animate-spin" />}
              Agendar cobrança
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
