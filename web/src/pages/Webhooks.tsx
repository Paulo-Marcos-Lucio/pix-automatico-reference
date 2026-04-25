import { ExternalLink, Webhook } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Webhooks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Endpoint de notificação assíncrona do BCB.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            POST /webhooks/bcb/charge-status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recebido pelo backend quando o BCB confirma <code>SETTLED</code> ou <code>FAILED</code>.
            O handler chama <code>UpdateChargeStatusUseCase</code> e a cobrança transiciona para
            o estado terminal — verificável em <a href="/charges" className="text-primary hover:underline">Charges</a>.
          </p>

          <div className="rounded-md border bg-muted/30 p-4 font-mono text-xs">
            <div className="mb-2 text-muted-foreground">Payload esperado:</div>
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
                mesmo webhook entregue 2× resulta no mesmo estado
              </li>
              <li>
                <Badge variant="success" className="mr-2">Validado</Badge>
                payload obrigatório via Bean Validation
              </li>
              <li>
                <Badge variant="success" className="mr-2">Rastreável</Badge>
                cada evento gera um span correlacionado pelo traceId
              </li>
              <li>
                <Badge variant="secondary" className="mr-2">Retorna 202</Badge>
                Accepted — processamento síncrono ao DB, async ao Kafka
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-warning/30 bg-warning/5 p-4 text-sm">
            <div className="mb-1 font-semibold text-warning-foreground">Auditoria de webhooks</div>
            <p className="text-muted-foreground">
              Para audit log dos webhooks recebidos historicamente, abre o Kafka UI ou o Grafana e
              filtra por evento <code>charge.settled</code> / <code>charge.failed</code>. Endpoint
              dedicado de listagem fica como roadmap (v0.3.0).
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="http://localhost:8089"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Kafka UI (:8089)
              </a>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Grafana (:3000)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
