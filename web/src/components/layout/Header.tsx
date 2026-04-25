import { useLocation } from "react-router-dom";
import { Activity, AlertCircle, BookOpen, ChevronRight, Heart } from "lucide-react";
import { useHealth } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  painel: "Painel",
  consentimentos: "Consentimentos",
  assinaturas: "Assinaturas",
  cobrancas: "Cobranças",
  notificacoes: "Notificações",
};

export default function Header() {
  const { data, isLoading, isError } = useHealth();
  const status = data?.status ?? (isError ? "DOWN" : isLoading ? "loading" : "UNKNOWN");
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] ?? (seg.length > 12 ? seg.slice(0, 8) + "…" : seg),
    last: i === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/70 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">Pix Automático</span>
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className={cn(b.last ? "font-medium text-foreground" : "text-muted-foreground")}>
              {b.label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <BookOpen className="h-3.5 w-3.5" />
          API
        </a>
        <a
          href="/actuator"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <Heart className="h-3.5 w-3.5" />
          Saúde
        </a>

        <div className="h-5 w-px bg-border/60" />

        <HealthIndicator status={status} />
      </div>
    </header>
  );
}

function HealthIndicator({ status }: { status: string }) {
  if (status === "UP") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Online
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <Activity className="h-3 w-3 animate-pulse" />
        Verificando
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
      <AlertCircle className="h-3 w-3" />
      {status === "DOWN" ? "Indisponível" : "Desconhecido"}
    </div>
  );
}
