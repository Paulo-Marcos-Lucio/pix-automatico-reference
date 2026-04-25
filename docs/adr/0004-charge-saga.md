# ADR 0004 — Charge saga orquestrada

## Status
Accepted

## Context
O fluxo de uma cobranca Pix Automatico atravessa sistema proprio + BC + banco do pagador:

```
SCHEDULED --(chamada ao BC)--> INITIATED --(webhook do BC)--> SETTLED | FAILED
```

Cada transicao pode falhar de modos diferentes:
- `SCHEDULED -> INITIATED`: 5xx do BC (retryable), 4xx (nao-retryable), timeout.
- `INITIATED -> SETTLED`: webhook pode atrasar ou nao vir — precisamos de polling + timeout.

Precisamos de um componente que saiba coordenar isso sem pollute-ar os agregados com logica de comunicacao externa.

## Decision
Saga **orquestrada** (nao coreografada), implementada em `application/charge/ChargeSaga.java`.

- Triggered pelo `ChargeScheduledEvent` consumido do Kafka (`ChargeScheduledListener`).
- Chama `BcbPixAutomaticoGateway.initiateCharge(charge)` via `@Retry` + `@CircuitBreaker` do Resilience4j.
- Sucesso: `charge.initiate(e2e)` -> persiste + appende ao outbox.
- `BcbClientException` (4xx nao-retryable): `charge.fail(code, msg)` -> persiste.
- `BcbServerException` (5xx/timeout): rethrow para acionar retry do Resilience4j; depois de esgotado, Kafka retry handler move para DLQ.
- Transicao `INITIATED -> SETTLED|FAILED` acontece via webhook em `WebhookController`, usando o mesmo caminho de `UpdateChargeStatusUseCase`.

## Consequences
### Positivo
- Orquestrador e **explicito**: um unico arquivo para ler o fluxo.
- Retry + circuit breaker em nivel de metodo, declarativo.
- Estado persistido no proprio agregado — sem tabela de saga_state separada.

### Negativo
- Acopla a saga ao BC gateway (aceitavel, e proposito dela).
- Nao cobrimos o caso de webhook perdido — adicionaremos um job scheduled `StuckChargePoller` em ADR futuro.

## Alternatives considered
- **Saga coreografada via eventos puros**: mais desacoplada mas mais dificil de debugar e compreender.
- **Frameworks de saga (Camunda, Temporal)**: overkill para fluxo de 3 estados e nao justifica operacao adicional nessa fase.
