import { NavLink } from "react-router-dom";
import {
  ArrowDownUp,
  CreditCard,
  FileSignature,
  LayoutDashboard,
  Repeat,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/consents", label: "Consents", icon: FileSignature },
  { to: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/charges", label: "Charges", icon: CreditCard },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ArrowDownUp className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Pix Automático</span>
          <span className="text-xs text-muted-foreground">Painel Operacional</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        <p>v0.2.0 · Reference Impl</p>
        <a
          href="https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference"
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block hover:text-foreground hover:underline"
        >
          GitHub →
        </a>
      </div>
    </aside>
  );
}
