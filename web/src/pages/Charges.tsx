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
  useCharges,
  useScheduleCharge,
  useSubscriptions,
} from "@/hooks/useApi";
import { formatCurrency, formatDate, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";

export default function Charges() {
  const { data, isLoading } = useCharges();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charges</h1>
          <p className="text-muted-foreground">
            Cobranças agendadas, iniciadas ou já liquidadas — auto-refresh a cada 5s.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Agendar cobrança
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
                <TableHead>ID</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Agendada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>EndToEndId</TableHead>
                <TableHead>Tentativas</TableHead>
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
                        Nenhuma cobrança ainda.
                      </TableCell>
                    </TableRow>
                  )
                  : data?.items.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">
                          <Link to={`/charges/${c.id}`} className="hover:underline">
                            {shortId(c.id)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/subscriptions`}
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {shortId(c.subscriptionId)}
                          </Link>
                        </TableCell>
                        <TableCell>{formatCurrency(c.amount, c.currency)}</TableCell>
                        <TableCell className="text-xs">{formatDate(c.scheduledFor)}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {c.endToEndId ? c.endToEndId.slice(0, 14) + "…" : "—"}
                        </TableCell>
                        <TableCell>{c.attemptCount}</TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
      toast({ title: "Cobrança agendada", description: "A saga vai iniciá-la em segundos." });
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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Subscription ativa</Label>
            <Select value={subscriptionId} onValueChange={setSubscriptionId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {active.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhuma subscription ativa
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
              <Label className="text-xs">Valor (BRL)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                required
              />
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
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
