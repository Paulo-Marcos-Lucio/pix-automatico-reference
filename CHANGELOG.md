# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Workflows de CI/CD profissionais: build paralelo, Testcontainers, ArchUnit, Semgrep, CodeQL, Trivy, dependency-review
- Release automation por tag (`v*.*.*`): build OCI image, push para GHCR, GitHub Release com SBOM (CycloneDX)
- Dependabot agrupado (Spring Boot, Testcontainers, observabilidade, resiliência)
- Templates de issue (bug, feature) e pull request
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`
- `CODEOWNERS` e `FUNDING.yml`

## [0.1.0] - 2026-04-19

### Added
- Domínio hexagonal: agregados `Consent`, `Subscription`, `Charge` com domain events
- Idempotência forte via `Idempotency-Key` + Redis + unique constraint
- Outbox Pattern com transação local + publisher Kafka assíncrono
- Saga orquestrada para o fluxo de cobrança (autorizar → agendar → iniciar → conciliar)
- Resiliência via Resilience4j (circuit breaker, retry, rate limiter, bulkhead)
- OAuth2 Client Credentials simulando mTLS / FAPI
- Observabilidade end-to-end: OpenTelemetry, Prometheus, Grafana, Tempo, Loki
- Testes unitários, integração (Testcontainers Postgres/Redis/Kafka), Pact, ArchUnit
- Migrations versionadas via Flyway
- OpenAPI 3 autogerado com SpringDoc
- 5 ADRs documentando decisões arquiteturais
- `docker-compose.yml` com toda a stack de apoio
- `Makefile` com targets de DX (`up`, `down`, `test`, `it`, `run`, `image`)

[Unreleased]: https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference/releases/tag/v0.1.0
