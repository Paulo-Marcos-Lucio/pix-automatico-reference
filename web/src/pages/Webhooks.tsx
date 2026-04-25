import { Bell, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Webhooks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Canal de retorno assíncrono do Banco Central para confirmar liquidação ou falha das cobranças.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            POST /webhooks/bcb/charge-status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Endereço chamado pelo Banco Central quando uma cobrança é finalizada — seja com
            sucesso (<code>SETTLED</code>) ou falha (<code>FAILED</code>). O servidor recebe o
            aviso e transita o estado da cobrança para o terminal correspondente. O resultado fica
            visível imediatamente em <a href="/cobrancas" className="text-primary hover:underline">Cobranças</a>.
          </p>

          <div className="rounded-md border bg-muted/30 p-4 font-mono text-xs">
            <div className="mb-2 text-muted-foreground">Formato do payload:</div>
            <pre>{JSON.stringify(
              {
                chargeId: "uuid",
                endToEndId: "E12345678AAAA...",
                status: "SETTLED",
                occurredAt: "2026-04-25T13:00:00Z",
                errorCode: null,
                errorMessage: null,
              },
              null,
              2,
            )}</pre>
          </div>

          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <div className="mb-2 font-semibold">Garantias do endpoint</div>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <Badge variant="success" className="mr-2">Idempotente</Badge>
                a mesma notificação entregue duas vezes resulta no mesmo estado final
              </li>
              <li>
                <Badge variant="success" className="mr-2">Validado</Badge>
                campos obrigatórios verificados pelas regras de validação
              </li>
              <li>
                <Badge variant="success" className="mr-2">Rastreável</Badge>
                cada notificação gera um rastro correlacionado por identificador único
              </li>
              <li>
                <Badge variant="secondary" className="mr-2">Resposta 202</Badge>
                Aceito — gravação no banco é síncrona, propagação posterior é assíncrona
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-warning/30 bg-warning/5 p-4 text-sm">
            <div className="mb-1 font-semibold text-warning-foreground">
              Histórico das notificações recebidas
            </div>
            <p className="text-muted-foreground">
              Para visualizar o histórico das notificações que já chegaram, abra o painel do Kafka
              ou o Grafana e filtre por evento <code>charge.settled</code> ou{" "}
              <code>charge.failed</code>. Uma página dedicada está prevista no roadmap.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="http://localhost:8089"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Painel do Kafka (porta 8089)
              </a>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Grafana (porta 3000)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
