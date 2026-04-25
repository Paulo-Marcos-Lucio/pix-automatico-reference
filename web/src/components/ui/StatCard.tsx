import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  to?: string;
  trend?: { value: number; label?: string };
  sparkData?: number[];
  tone?: "primary" | "success" | "warning" | "destructive" | "info";
  loading?: boolean;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, { bg: string; text: string; spark: string }> = {
  primary:     { bg: "bg-primary/10",     text: "text-primary",     spark: "stroke-primary" },
  success:     { bg: "bg-success/10",     text: "text-success",     spark: "stroke-success" },
  warning:     { bg: "bg-warning/15",     text: "text-warning",     spark: "stroke-warning" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", spark: "stroke-destructive" },
  info:        { bg: "bg-info/10",        text: "text-info",        spark: "stroke-info" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
  trend,
  sparkData,
  tone = "primary",
  loading,
}: StatCardProps) {
  const ts = toneStyles[tone];
  const Wrapper: React.ElementType = to ? Link : "div";
  const wrapperProps = to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200",
        to && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
              ts.bg,
              ts.text,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(trend || sparkData) && (
        <div className="mt-4 flex items-end justify-between gap-3">
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                trend.value >= 0
                  ? "bg-success-soft text-success"
                  : "bg-destructive-soft text-destructive",
              )}
            >
              {trend.value >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%{trend.label ? <span className="text-muted-foreground"> {trend.label}</span> : null}
            </div>
          )}
          {sparkData && sparkData.length > 1 && (
            <div className="ml-auto h-8 w-24">
              <Sparkline data={sparkData} className={ts.spark} />
            </div>
          )}
        </div>
      )}

      {/* Hover ray */}
      {to && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className={cn("absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl", ts.bg)} />
        </div>
      )}
    </Wrapper>
  );
}
