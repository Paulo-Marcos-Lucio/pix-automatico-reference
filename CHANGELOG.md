# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added — Frontend (painel operacional)
- SPA em React 18 + TypeScript + Vite + Tailwind + shadcn/ui (Radix) + TanStack Query + React Router empacotada **dentro do mesmo JAR** do backend (single-artifact deploy)
- 7 páginas: Dashboard com KPIs e feed ao vivo, Consents (tabela + criar + drill-down + autorizar/revogar), ConsentDetail, Subscriptions, Charges (auto-refresh 5s), ChargeDetail com timeline visual da saga, Webhooks (documentação do contrato)
- API client em `web/src/lib/api.ts` com injeção automática de `Idempotency-Key` UUIDv4 nos POSTs
- Vite proxy de dev (:5173 → :8080) — sem CORS em dev, sem dois deploys em prod
- Dark theme via CSS variables (preparado, default light)
- frontend-maven-plugin no pom.xml — Maven baixa Node + npm + builda o frontend automaticamente
- WebMvcConfig com PathResourceResolver fazendo fallback pra `index.html` em deep links da SPA
- `.gitignore` atualizado: `web/node_modules/`, `web/dist/`, `src/main/resources/static/`
- Makefile: novos targets `web-dev`, `web-build`, `run-fast`
- CI: novo job `Frontend build` (parallel ao backend) com cache de npm
- CLAUDE.md: seção de convenções do frontend

### Added — Backend (LIST endpoints)
- `GET /v1/consents?page&size` — lista paginada de consents
- `GET /v1/charges?page&size` — lista paginada de charges
- `GET /v1/subscriptions?page&size` — lista paginada de subscriptions
- `GET /v1/subscriptions/{id}` — busca subscription por ID
- Novos use cases em `domain/port/in/`: `ListConsentsUseCase`, `ListChargesUseCase`, `ListSubscriptionsUseCase`, `GetSubscriptionUseCase`
- `findAll(int page, int size)` e `count()` em todos os repositórios (port out + adapters)
- `SubscriptionView` DTO + factory `from(Subscription)` para uniformizar conversão
- Resposta paginada padronizada: `{ items, total, page, size }`

## [0.1.0] - 2026-04-25

Primeira release pública. Implementação de referência completa, com CI/CD, observabilidade e testes de integração rodando.

### Added — Domínio
- Agregados hexagonais `Consent`, `Subscription`, `Charge` com domain events e invariantes do BCB
- Idempotência forte via header `Idempotency-Key` (UUID v4) + Redis + unique constraint no Postgres
- Outbox Pattern: transação local atômica + publisher Kafka assíncrono
- Saga orquestrada para o fluxo de cobrança (autorizar → agendar → iniciar → conciliar)
- Resilience4j: circuit breaker, retry, rate limiter, bulkhead por endpoint
- OAuth2 Client Credentials simulando mTLS / FAPI para chamadas ao BCB
- Observabilidade end-to-end: OpenTelemetry traces, Prometheus metrics, logs JSON estruturados pra Loki — todos correlacionados por `traceId`
- Migrations versionadas via Flyway
- OpenAPI 3 autogerado via SpringDoc
- 5 ADRs documentando decisões arquiteturais não triviais

### Added — Testes
- Testes unitários puros do domínio (`ChargeTest`, `ConsentTest`, `MoneyTest`, `PixKeyTest`)
- Testes de aplicação com Mockito (`ChargeSagaTest`, `IdempotencyServiceTest`)
- Testes de arquitetura via ArchUnit (`HexagonalArchitectureTest`) impondo as fronteiras hexagonais no CI
- Testes de integração via Testcontainers (Postgres + Redis + Kafka): `ConsentLifecycleIT`, `IdempotencyContractIT`, `WebhookSettlementIT`

### Added — Tooling
- Workflows GitHub Actions: `ci.yml` (jobs paralelos: build, unit, IT, ArchUnit, Semgrep SAST, Trivy image scan, Docker build), `codeql.yml` (semanal + on-PR), `release.yml` (tag-driven OCI image + GHCR push + GitHub Release com SBOM CycloneDX), `dependency-review.yml`
- Dependabot agrupado por categoria: Spring Boot, Testcontainers, observabilidade, resiliência, GitHub Actions, Docker
- Templates de issue (bug, feature) e pull request, `CODEOWNERS`, `FUNDING.yml`
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`
- `docker-compose.yml` com toda a stack de apoio (Postgres, Redis, Kafka, Otel Collector, Prometheus, Tempo, Loki, Grafana, Kafka UI)
- `Makefile` com targets de DX (`up`, `down`, `test`, `it`, `run`, `image`)
- `CLAUDE.md` com convenções e comandos pra sessões futuras de desenvolvimento assistido

### Fixed — descobertas durante o bring-up do CI
- **`ConsentService` colidia em `handle(UUID)`**: implementava `GetConsentUseCase` (retorna `Consent`) e `AuthorizeConsentUseCase` (retorna `void`) com a mesma assinatura. Renomeados todos os métodos `handle()` dos use cases pra verbos expressivos (`create`, `getById`, `authorize`, `revoke`, `schedule`, `updateStatus`). O conflito quebrava o annotation processing do Lombok em cascata e deixava o build com mais de 100 erros enganosos
- **State machine de `Charge` não permitia `SCHEDULED → FAILED`**: saga falhava ao tratar erros 4xx do BCB que ocorrem antes da iniciação. Adicionado `FAILED` às transições válidas a partir de `SCHEDULED`
- **`JacksonConfig` causava `NoUniqueBeanDefinitionException` no startup**: definia tanto um `Jackson2ObjectMapperBuilderCustomizer` quanto um `ObjectMapper` que injetava um único customizer (existem 2 no contexto). Removido o `@Bean` manual; `JacksonAutoConfiguration` do Spring Boot agora compõe o `ObjectMapper` aplicando todos os customizers em escopo
- **Domínio + JPA dobravam o `version`**: agregados incrementavam `version++` em cada mutação e a entidade JPA também tinha `@Version`, gerando `StaleObjectStateException` em todos os updates. Removido o incremento manual — versão é responsabilidade exclusiva do `@Version`

### Fixed — CI
- `aquasecurity/trivy-action` referenciado sem prefixo `v` na versão (`0.28.0` em vez de `v0.36.0`); pinado na tag estável mais recente
- `ConsentLifecycleIT` chamava `POST /authorize` sem header `Idempotency-Key`, contrariando o contrato; teste atualizado

[Unreleased]: https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference/releases/tag/v0.1.0
