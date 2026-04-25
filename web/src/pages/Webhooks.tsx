import {
  Activity,
  Bell,
  CheckCircle2,
  ExternalLink,
  Eye,
  Send,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Idempotente",
    description: "Mesma notificação entregue 2× resulta no mesmo estado final.",
    tone: "success" as const,
  },
  {
    icon: CheckCircle2,
    title: "Validado",
    description: "Campos obrigatórios verificados pelas regras de validação.",
    tone: "success" as const,
  },
  {
    icon: Eye,
    title: "Rastreável",
    description: "Cada notificação gera um rastro correlacionado por identificador único.",
    tone: "success" as const,
  },
  {
    icon: Send,
    title: "Resposta 202 Accepted",
    description: "Gravação no banco é síncrona, propagação posterior é assíncrona via Kafka.",
    tone: "info" as const,
  },
];

const payloadExample = {
  chargeId: "uuid",
  endToEndId: "E12345678AAAA...",
  status: "SETTLED",
  occurredAt: "2026-04-25T13:00:00Z",
  errorCode: null,
  errorMessage: null,
};

export default function Webhooks() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integração externa"
        title="Notificações"
        description="Canal de retorno assíncrono do Banco Central para confirmar liquidação ou falha das cobranças. Configurado e rastreado fim a fim."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Endpoint principal */}
        <div className="space-y-6">
          {/* Endpoint URL display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Webhook className="h-4 w-4" />
                </div>
                Endpoint público
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-gradient-to-r from-muted/40 to-muted/20 p-3 font-mono text-sm">
                <span className="rounded-md bg-success px-2 py-0.5 text-2xs font-bold tracking-wider text-success-foreground">
                  POST
                </span>
                <span className="select-all text-foreground">/webhooks/bcb/charge-status</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Endereço chamado pelo Banco Central quando uma cobrança é finalizada — seja com
                sucesso{" "}
                <code className="rounded bg-success-soft px-1.5 py-0.5 font-mono text-xs text-success">
                  SETTLED
                </code>{" "}
                ou falha{" "}
                <code className="rounded bg-destructive-soft px-1.5 py-0.5 font-mono text-xs text-destructive">
                  FAILED
                </code>
                . O servidor recebe o aviso, transita a cobrança para o estado terminal e o
                resultado aparece imediatamente em{" "}
                <a href="/cobrancas" className="font-medium text-primary hover:underline">
                  Cobranças
                </a>
                .
              </p>
            </CardContent>
          </Card>

          {/* Payload terminal-style */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info-soft text-info">
                  <Activity className="h-4 w-4" />
                </div>
                Formato do payload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-md">
                <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="ml-2 font-mono text-2xs text-zinc-500">payload.json</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-100">
                  <code dangerouslySetInnerHTML={{ __html: highlight(payloadExample) }} />
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Guarantees grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Garantias do endpoint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {guarantees.map((g) => (
                  <div
                    key={g.title}
                    className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 transition-shadow hover:shadow-sm"
                  >
                    <div
                      className={
                        g.tone === "success"
                          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success"
                          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info"
                      }
                    >
                      <g.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{g.title}</p>
                      <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">
                        {g.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com observabilidade */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-primary" />
                Observabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xs leading-relaxed text-muted-foreground">
                Para inspecionar as notificações que já chegaram, abra o painel do Kafka ou o
                Grafana e filtre pelo evento{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-2xs">charge.settled</code> ou{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-2xs">charge.failed</code>.
              </p>

              <div className="space-y-2">
                <ExternalAction
                  href="http://localhost:8089"
                  label="Painel do Kafka"
                  detail="porta 8089 · tópicos e mensagens"
                />
                <ExternalAction
                  href="http://localhost:3000"
                  label="Grafana"
                  detail="porta 3000 · traces · logs · métricas"
                />
                <ExternalAction
                  href="http://localhost:8080/swagger-ui.html"
                  label="API · Swagger UI"
                  detail="contrato OpenAPI vivo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-warning" />
                Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xs leading-relaxed text-muted-foreground">
                Página dedicada de histórico de notificações recebidas (com filtros, busca e drill-down)
                está prevista para a próxima iteração.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ExternalAction({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary-soft/30"
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-2xs text-muted-foreground">{detail}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-primary" />
    </a>
  );
}

// Pequeno highlighter inline pra não puxar dependência externa de syntax highlight
function highlight(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span style="color:#7dd3fc">$1</span>$2')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span style="color:#fde68a">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:#fb7185">$1</span>')
    .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span style="color:#86efac">$1</span>');
}
