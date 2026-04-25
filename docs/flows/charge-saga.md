# Fluxo detalhado — Charge Saga

```mermaid
sequenceDiagram
    autonumber
    participant M as Merchant
    participant API as REST API
    participant DB as Postgres
    participant OB as Outbox
    participant K as Kafka
    participant S as ChargeSaga
    participant BC as BCB Gateway
    participant WH as Webhook

    M->>+API: POST /v1/charges (Idempotency-Key)
    API->>+DB: INSERT charge (SCHEDULED) + outbox(ChargeScheduledEvent)
    DB-->>-API: OK (same TX)
    API-->>-M: 201 { chargeId, status: SCHEDULED }

    loop every 500ms
        OB->>K: publish ChargeScheduledEvent
        OB->>DB: mark publishedAt
    end

    K->>+S: onChargeScheduled(chargeId)
    S->>+BC: initiateCharge(charge)
    alt sucesso
        BC-->>-S: BcbChargeResponse(e2eid, INITIATED)
        S->>DB: UPDATE charge SET status=INITIATED, e2eid
        S->>OB: append ChargeInitiatedEvent
    else BcbServerException (5xx/timeout)
        BC-->>S: erro
        S->>S: @Retry / @CircuitBreaker
    else BcbClientException (4xx)
        BC-->>S: erro
        S->>DB: UPDATE charge SET status=FAILED
        S->>OB: append ChargeFailedEvent
    end

    Note over BC: SPI processa cobranca contra banco do pagador

    BC->>+WH: POST /webhooks/bcb/charge-status
    WH->>+DB: UPDATE charge SET status=SETTLED/FAILED
    DB-->>-WH: OK
    WH-->>-BC: 202 Accepted
```

## Invariantes

- Uma cobranca nunca vai de `SCHEDULED -> SETTLED` direto (precisa passar por `INITIATED`).
- `INITIATED` sempre tem `endToEndId` nao-nulo.
- Webhook que chega antes do retorno sincrono do BC e tratado pela idempotencia da state machine: se ja estamos em `INITIATED`, `settle()` transiciona; se estamos em `SCHEDULED`, throw `IllegalStateException` (400/409 pro BC) e o BC reprocessa.
- Eventos no outbox sao numerados por `occurredAt` e consumidos em ordem por agregado (partition key = `aggregateId`).
