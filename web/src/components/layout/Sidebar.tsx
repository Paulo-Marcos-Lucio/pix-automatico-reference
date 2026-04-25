import { NavLink } from "react-router-dom";
import {
  Bell,
  CreditCard,
  FileSignature,
  Github,
  LayoutDashboard,
  Repeat,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const groups: { group: string; entries: NavItem[] }[] = [
  {
    group: "Operação",
    entries: [
      { to: "/painel", label: "Painel", icon: LayoutDashboard },
      { to: "/consentimentos", label: "Consentimentos", icon: FileSignature },
      { to: "/assinaturas", label: "Assinaturas", icon: Repeat },
      { to: "/cobrancas", label: "Cobranças", icon: CreditCard },
    ],
  },
  {
    group: "Integração",
    entries: [
      { to: "/notificacoes", label: "Notificações", icon: Bell },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-glow">
          <Zap className="h-5 w-5" strokeWidth={2.5} />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/30 to-white/10 mix-blend-overlay" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">Pix Automático</span>
          <span className="text-[11px] font-medium text-muted-foreground">Painel Operacional</span>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">
        {groups.map((g) => (
          <div key={g.group} className="space-y-1">
            <h4 className="px-3 pb-1 text-2xs font-bold uppercase tracking-wider text-muted-foreground/70">
              {g.group}
            </h4>
            {g.entries.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-soft/80 text-primary-deep shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/80 group-hover:text-foreground",
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border/60 p-4">
        <div className="rounded-lg border border-border/60 bg-gradient-to-br from-primary-soft/60 to-card p-3">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">v0.3.0</span>
          </div>
          <p className="mt-1 text-2xs text-muted-foreground">Implementação de referência</p>
        </div>
        <a
          href="https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-2xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          Ver no GitHub
        </a>
      </div>
    </aside>
  );
}
