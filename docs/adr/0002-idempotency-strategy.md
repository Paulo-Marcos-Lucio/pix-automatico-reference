# ADR 0002 — Estrategia de idempotencia para POSTs

## Status
Accepted

## Context
Todo fluxo financeiro — especialmente cobrancas recorrentes — precisa ser seguro contra:
- Retries de cliente (timeout de rede levando o cliente a repostar).
- Re-entrega de webhook do proprio BC.
- Pipelines de mensageria que podem duplicar entregas (at-least-once).

Sem idempotencia, o usuario final recebe duas cobrancas pelo mesmo consumo. Custo financeiro e reputacional enorme.

## Decision
Padrao `Idempotency-Key` header, exigido obrigatoriamente em todos os POSTs sob `/v1/consents`, `/v1/subscriptions`, `/v1/charges`.

- **Formato**: UUIDv4. Recusamos qualquer outra coisa (400 Bad Request).
- **Fingerprint**: SHA-256 de `METHOD + URI + body`. Se o cliente reusa a mesma key com payload diferente -> 409 Conflict (`IdempotencyConflictException`).
- **Armazenamento**: Redis (`idem:<key>`), TTL 24h.
- **Estados**: `reserved` (primeiro POST em voo) -> `committed` (resposta 2xx gravada para replay).
- **Replay**: POST identico com a mesma key retorna exatamente a resposta original + header `Idempotency-Replayed: true`.

## Consequences
### Positivo
- Cliente pode fazer retry sem medo.
- Divergencia de payload e detectavel (e util — cliente de boa-fe raramente difere).
- TTL de 24h cobre janela de retry razoavel sem custos de memoria altos.

### Negativo
- Exige Redis sempre disponivel. Mitigado com Redis Sentinel/Cluster em producao.
- Nao cobre idempotencia entre processos concorrentes na MESMA key — precisaria de lock distribuido. Deixamos como extensao (ADR futuro).

## Alternatives considered
- **Idempotencia via chave natural** (ex: hash do payload): vulneravel a casos onde duas requests legitimas tem mesmo payload (dois pagamentos identicos em minutos diferentes).
- **Database constraint**: lento, e Redis e naturalmente mais rapido para TTL.
