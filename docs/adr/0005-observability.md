# ADR 0005 — Observabilidade e correlacao

## Status
Accepted

## Context
Sistema integrado com BC precisa de diagnostico rapido. Um "cobranca nao caiu" pode ter falhado em:
- Validacao local (dominio).
- Outbox (evento presente mas nao publicado).
- Kafka consumer (lag, dead letter).
- BC gateway (timeout, circuit breaker open).
- Webhook (nao chegou ou chegou com falha de validacao).

Sem observabilidade unificada, cada investigacao vira correria entre logs, APM e dashboards.

## Decision
Stack unificada baseada em **OpenTelemetry**, tres pilares, todos correlacionados por `traceId`:

1. **Traces**: Micrometer Tracing + OTel bridge -> OTLP exporter -> Tempo.
2. **Metricas**: Micrometer -> Prometheus scrape em `/actuator/prometheus`.
3. **Logs**: Logback -> JSON estruturado via Logstash encoder -> OTLP -> Loki.

Cada log inclui `traceId` e `spanId` no MDC, permitindo click-through no Grafana de log -> trace -> metric.

Metricas customizadas criadas para:
- `outbox.published` / `outbox.failed` (por eventType)
- `saga.charge.handled` (por outcome)
- `http.server.requests` com histogram de latencia (default do Spring)

## Consequences
### Positivo
- SRE / on-call tem um unico dashboard (Grafana) para diagnostico.
- Correlacao de logs x traces x metricas e **automatica**, nao manual.
- Troca de backend futuro (Datadog, New Relic) e feita so no OTel Collector.

### Negativo
- Volume de telemetria pode ser significativo — `sampling.probability=1.0` em dev, deve cair em prod (0.05-0.1).
- Stack adicional (Tempo, Loki) no docker-compose.

## Alternatives considered
- **APM vendor-locked (Datadog, New Relic)**: rapido mas caro e acopla o codigo ao vendor. OTel e o padrao da industria para 2026.
- **Elastic Stack (ELK)**: logs sim, mas fraco para traces distribuidos. Descartado.
