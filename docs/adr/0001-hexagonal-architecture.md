# ADR 0001 — Hexagonal Architecture (Ports & Adapters)

## Status
Accepted

## Context
O projeto precisa sobreviver a mudancas de:
- **Infra-estrutura tecnica** (trocar Postgres por outro DB, Kafka por SQS, Redis por outro cache).
- **Contratos externos** (as APIs do Banco Central mudam, tanto o formato dos endpoints quanto o stack de seguranca — de mTLS para OAuth DPoP, por exemplo).
- **Adaptadores de entrada** (hoje HTTP REST, amanha pode ter Kafka consumer, CLI, SOAP).

Uma arquitetura em camadas tradicional (Controller -> Service -> Repository) acopla logica de negocio a frameworks e amplifica o custo de cada mudanca.

## Decision
Adotar arquitetura hexagonal (Ports & Adapters):

- **Domain** (`dev.pmlsp.pixauto.domain`): regras puras, sem dependencias de framework. Contem agregados, value objects, eventos de dominio, *ports* (interfaces `in/out`).
- **Application** (`dev.pmlsp.pixauto.application`): orquestracao de casos de uso, sagas. Depende apenas de `domain`. Sem JPA, sem Kafka, sem Spring-specific imports fora de `@Service`/`@Transactional`.
- **Infrastructure** (`dev.pmlsp.pixauto.infrastructure`): implementa os *ports de saida* (JPA, Kafka, Redis, HTTP client para BC).
- **Adapter/Web** (`dev.pmlsp.pixauto.adapter.web`): controllers, filtros, DTOs — traduz HTTP para use case commands.

ArchUnit (`HexagonalArchitectureTest`) enforca estas regras na pipeline.

## Consequences
### Positivo
- Testes de dominio sao microsegundos (sem container, sem Spring context).
- Trocar um adapter (ex: Kafka -> Google Pub/Sub) nao toca o dominio.
- Leitura top-down do dominio nao precisa passar por JPA annotations.

### Negativo
- Mais classes: JPA entity + domain entity + mapper. **Aceitamos** porque o custo de manutencao e menor do que o custo de desacoplar depois.
- Iniciantes podem achar verbose. Mitigado com Lombok e records.

## Alternatives considered
- **Clean Architecture** (Uncle Bob): muito similar, maior formalismo de camadas. Optamos por Hexagonal por ser mais pragmatico em Spring Boot.
- **Spring's default layered**: simples mas vaza framework em todo lugar.
