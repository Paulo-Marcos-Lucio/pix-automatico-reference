import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
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
import { useConsents } from "@/hooks/useApi";
import { formatCurrency, formatDate, maskDocument, shortId } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { frequencyLabel, pixKeyTypeLabel } from "@/lib/i18n";
import CreateConsentDialog from "./consents/CreateConsentDialog";

export default function Consents() {
  const [page] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError } = useConsents(page, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consentimentos</h1>
          <p className="text-muted-foreground">
            Autorizações de recorrência registradas no Banco Central.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Novo consentimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {data ? `${data.total} no total` : "Carregando..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              Erro ao carregar os consentimentos. Verifique se o servidor está rodando na porta 8080.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificador</TableHead>
                <TableHead>Pagador</TableHead>
                <TableHead>Chave Pix</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>1ª cobrança</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                        Nenhum consentimento ainda. Crie o primeiro no botão acima.
                      </TableCell>
                    </TableRow>
                  )
                  : data?.items.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer">
                        <TableCell className="font-mono text-xs">
                          <Link to={`/consentimentos/${c.id}`} className="hover:underline">
                            {shortId(c.id)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>{c.payerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {maskDocument(c.payerDocument)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{pixKeyTypeLabel[c.receiverKeyType]}</div>
                          <div className="text-muted-foreground">{c.receiverKeyValue}</div>
                        </TableCell>
                        <TableCell>{frequencyLabel[c.frequency]}</TableCell>
                        <TableCell>{formatCurrency(c.amount, c.currency)}</TableCell>
                        <TableCell>{formatDate(c.firstCharge)}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateConsentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
