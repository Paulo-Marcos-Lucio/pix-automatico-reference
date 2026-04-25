import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileSignature, Filter, Plus } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useConsents } from "@/hooks/useApi";
import { formatCurrency, formatDate, maskDocument, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { frequencyLabel, pixKeyTypeLabel } from "@/lib/i18n";
import type { ConsentStatus } from "@/lib/types";
import CreateConsentDialog from "./consents/CreateConsentDialog";

const filterTabs: { value: "ALL" | ConsentStatus; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "AWAITING_AUTHORIZATION", label: "Aguardando" },
  { value: "AUTHORIZED", label: "Autorizados" },
  { value: "REVOKED", label: "Revogados" },
  { value: "EXPIRED", label: "Expirados" },
];

export default function Consents() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | ConsentStatus>("ALL");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useConsents(0, 100);

  const filtered = useMemo(() => {
    let items = data?.items ?? [];
    if (filter !== "ALL") items = items.filter((c) => c.status === filter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.payerName.toLowerCase().includes(q) ||
          c.payerDocument.toLowerCase().includes(q) ||
          c.receiverKeyValue.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, filter, search]);

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    return {
      ALL: items.length,
      AWAITING_AUTHORIZATION: items.filter((c) => c.status === "AWAITING_AUTHORIZATION").length,
      AUTHORIZED: items.filter((c) => c.status === "AUTHORIZED").length,
      REVOKED: items.filter((c) => c.status === "REVOKED").length,
      EXPIRED: items.filter((c) => c.status === "EXPIRED").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recorrências"
        title="Consentimentos"
        description="Autorizações que o pagador concedeu pra cobrança recorrente, registradas no Banco Central."
        actions={
          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus />
            Novo consentimento
          </Button>
        }
      />

      {/* Filter bar */}
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

        <div className="flex items-center gap-2">
          <div className="w-64">
            <SearchInput
              placeholder="Buscar por nome, documento, chave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0" disabled>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {isError && (
            <div className="m-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              Erro ao carregar os consentimentos. Verifique se o servidor está rodando na porta 8080.
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileSignature}
                title={search || filter !== "ALL" ? "Nenhum consentimento corresponde ao filtro" : "Nenhum consentimento ainda"}
                description={
                  search || filter !== "ALL"
                    ? "Tente ajustar a busca ou trocar o filtro de situação."
                    : "Cadastre o primeiro consentimento pra que o pagador possa autorizar recorrências."
                }
                action={
                  !search && filter === "ALL" ? (
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus className="h-4 w-4" /> Novo consentimento
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
                  <TableHead>Pagador</TableHead>
                  <TableHead>Chave Pix</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>1ª cobrança</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="group cursor-pointer">
                    <TableCell className="font-mono text-2xs text-muted-foreground">
                      <Link to={`/consentimentos/${c.id}`}>{shortId(c.id)}</Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`} className="block">
                        <p className="font-medium text-foreground">{c.payerName}</p>
                        <p className="text-2xs text-muted-foreground">{maskDocument(c.payerDocument)}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`} className="block text-2xs">
                        <p className="font-medium text-foreground">{pixKeyTypeLabel[c.receiverKeyType]}</p>
                        <p className="text-muted-foreground">{c.receiverKeyValue}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`} className="text-sm">
                        {frequencyLabel[c.frequency]}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/consentimentos/${c.id}`} className="font-semibold tabular-nums">
                        {formatCurrency(c.amount, c.currency)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`} className="text-sm">
                        {formatDate(c.firstCharge)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`}>
                        <StatusBadge status={c.status} />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/consentimentos/${c.id}`} className="flex justify-end">
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

      {/* Footer with pagination summary */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-2xs text-muted-foreground">
          <span>
            Exibindo <strong className="text-foreground">{filtered.length}</strong> de{" "}
            <strong className="text-foreground">{data?.total ?? 0}</strong> consentimentos
          </span>
          <span>Atualizado automaticamente</span>
        </div>
      )}

      <CreateConsentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
