# C4 — Nivel 3: Componentes da API

```mermaid
flowchart LR
    subgraph Adapter[adapter.web]
        CC[ConsentController]
        SC[SubscriptionController]
        CHC[ChargeController]
        WH[WebhookController]
        IF[IdempotencyFilter]
        EH[GlobalExceptionHandler]
    end

    subgraph Application[application]
        CS[ConsentService]
        SS[SubscriptionService]
        CRS[ChargeService]
        SAGA[ChargeSaga]
        IS[IdempotencyService]
    end

    subgraph Domain[domain]
        direction TB
        AR{{Consent / Subscription / Charge}}
        EV{{Domain Events}}
        PORTS[[Ports in / out]]
    end

    subgraph Infra[infrastructure]
        CR[(ConsentRepoAdapter)]
        SR[(SubscriptionRepoAdapter)]
        CHR[(ChargeRepoAdapter)]
        OUT[(JpaOutboxStore)]
        OP[OutboxPublisher]
        CSL[ChargeScheduledListener]
        RID[(RedisIdempotencyStore)]
        GW[SimulatedBcbGateway]
    end

    IF --> IS
    CC --> CS
    SC --> SS
    CHC --> CRS
    WH --> CRS

    CS --> AR
    SS --> AR
    CRS --> AR
    SAGA --> AR

    CS --> PORTS
    SS --> PORTS
    CRS --> PORTS
    SAGA --> PORTS
    IS --> PORTS

    PORTS --> CR
    PORTS --> SR
    PORTS --> CHR
    PORTS --> OUT
    PORTS --> RID
    PORTS --> GW

    OP --> OUT
    OP -->|publish| KAFKA((Kafka))
    KAFKA --> CSL
    CSL --> SAGA
```

## Regras ArchUnit

- `domain` nao importa `infrastructure`, `adapter`, `org.springframework.*`, `org.hibernate.*`.
- `application` nao importa `infrastructure`, `adapter`.
- `adapter` nao e acessado por ninguem (e entry point).
- Teste automatizado em `HexagonalArchitectureTest` falha o build se violado.
