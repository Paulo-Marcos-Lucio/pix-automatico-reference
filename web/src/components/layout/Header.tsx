import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHealth } from "@/hooks/useApi";

export default function Header() {
  const { data, isLoading, isError } = useHealth();
  const status = data?.status ?? (isError ? "DOWN" : isLoading ? "loading" : "UNKNOWN");

  const indicator =
    status === "UP" ? (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Online
      </Badge>
    ) : status === "loading" ? (
      <Badge variant="secondary" className="gap-1">
        <Activity className="h-3 w-3 animate-pulse" />
        Verificando
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        {status === "DOWN" ? "Indisponível" : "Desconhecido"}
      </Badge>
    );

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold">Painel</h1>
        <Badge variant="outline" className="text-xs font-mono">
          dev.pmlsp.pixauto
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          API ↗
        </a>
        <a
          href="/actuator"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Saúde ↗
        </a>
        {indicator}
      </div>
    </header>
  );
}
