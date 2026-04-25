# ADR 0003 — Transactional Outbox Pattern

## Status
Accepted

## Context
Quando um agregado muda de estado (ex: `Charge` scheduled), precisamos:
1. Persistir o novo estado no Postgres.
2. Publicar um evento (`ChargeScheduledEvent`) no Kafka, para que downstream (saga, auditoria, analytics) reaja.

Se publicarmos DIRETO no Kafka dentro da mesma transacao JPA:
- Commit do banco sucede, publicacao falha (broker down): **evento perdido**.
- Commit do banco falha mas evento foi publicado: **evento "fantasma"** descreve estado que nunca existiu.

Dual-write problem classico.

## Decision
Usar o **Transactional Outbox Pattern**:

1. Servico de aplicacao persiste agregado + registra eventos na tabela `outbox` **na mesma transacao**.
2. Um `OutboxPublisher` (@Scheduled, intervalo 500ms) le eventos `publishedAt IS NULL`, publica no Kafka, marca como publicado. Em outra transacao.
3. Consumer do Kafka lida com duplicatas (idempotencia de lado do consumidor, via eventId).

Usamos `SELECT ... FOR UPDATE` (PESSIMISTIC_WRITE) no poller para permitir multiplos pods sem reentregar o mesmo evento.

## Consequences
### Positivo
- Garantia at-least-once end-to-end.
- Auditoria embutida (tabela outbox serve de historico).
- Sem dependencia do Kafka para a transacao de negocio.

### Negativo
- Latencia adicional (~500ms media para eventos saiem do outbox).
- Contra-pressao no DB se o publisher falhar continuamente (mitigado com `MAX_ATTEMPTS` = 5, depois marca como poison).
- Consumer PRECISA ser idempotente (ja contabilizamos isso via state machine no agregado).

## Alternatives considered
- **Change Data Capture com Debezium**: mais robusto mas muito mais operacao (Debezium + Kafka Connect). Overkill para stage atual.
- **Publish-then-save** com compensating action: fragil, so cobre alguns modos de falha.
- **Two-phase commit (XA)**: performance horrivel, pouco suporte moderno.
