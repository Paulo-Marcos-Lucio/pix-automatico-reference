# Guia para Claude

Notas internas para sessões futuras de desenvolvimento assistido por IA. Não é documentação para usuários — para isso veja [README.md](./README.md) e [CONTRIBUTING.md](./CONTRIBUTING.md).

## O que este projeto é

Implementação de **referência** (não app pronto) do Pix Automático + Open Finance Brasil. O posicionamento é portfolio público de consultoria — qualquer mudança deve preservar/elevar o nível profissional do código e da documentação.

## Convenções inegociáveis

### Arquitetura hexagonal
- `domain/` é **puro**: sem Spring, sem Jakarta, sem JPA, sem nada externo. Só Java + Lombok.
- `application/` depende **apenas** de `domain/`. Nunca importe de `infrastructure/` ou `adapter/`.
- `infrastructure/` implementa portas de saída (`domain/port/out/`).
- `adapter/web/` é o ponto de entrada HTTP — controllers, DTOs, filters.
- `HexagonalArchitectureTest` (ArchUnit) valida tudo isso no CI. Não burlar.

### Idempotência
- Todo `POST` em `/v1/consents`, `/v1/subscriptions`, `/v1/charges` exige header `Idempotency-Key` (UUID v4) — enforced pelo `IdempotencyFilter`.
- Falta de header → `400`. Header não-UUID → `400`. Mesma key + payload diferente → `409`. Mesma key + mesmo payload → replay com header `Idempotency-Replayed: true`.

### Versionamento de agregados
- O domínio **não** incrementa `version` em mutations. Quem cuida é o `@Version` da entidade JPA. Tem comentário explicando isso no commit `ab61990`.
- Não reintroduzir `this.version++` no domínio mesmo que pareça lógico.

### State machine de Charge
- Transições válidas: `SCHEDULED → INITIATED|CANCELLED|FAILED`, `INITIATED → SETTLED|FAILED`. Estados terminais: `SETTLED`, `FAILED`, `CANCELLED`.
- `SCHEDULED → FAILED` é permitido pra erro 4xx do BCB que falha antes da iniciação. Não remover.

### Outbox + Saga
- Toda mutação que dispara evento de domínio: persistir no DB **e** chamar `outbox.append(...)` na **mesma transação**.
- O `OutboxPublisher` faz o publish assíncrono pro Kafka. Não publish direto do service.
- O `ChargeSaga` reage ao evento `ChargeScheduled` e chama o BCB. SETTLED/FAILED vêm via webhook (`UpdateChargeStatusUseCase`).

### Testes
- Unit: `*Test.java` em `src/test/java/...`. Domínio puro testado direto. Application testa com Mockito mockando ports.
- Integration: `*IT.java`, herda de `AbstractIntegrationIT`. Usa Testcontainers (Postgres + Redis + Kafka). **Nunca** mockar DB/Kafka/Redis em IT.
- Architecture: `HexagonalArchitectureTest`.
- Surefire roda `*Test.java` na fase `test`. Failsafe roda `*IT.java` na fase `verify`.

## Comandos frequentes

```bash
# Stack local (Postgres, Redis, Kafka, observabilidade)
make up
make down

# Build / testes
make test     # unit
make it       # unit + integration via Testcontainers
make build    # mvn package -DskipTests (com frontend bundled)

# Run app
make run        # API + UI bundled em :8080
make run-fast   # só backend, pula build do frontend (-Dskip.web=true)

# Frontend
make web-dev    # Vite dev server :5173 com proxy pra backend :8080 (hot reload)
make web-build  # só o frontend → src/main/resources/static/

# Imagem OCI via Buildpacks
make image
```

## Operações no GitHub via gh

`gh` está autenticado via env var puxando o PAT do Git Credential Manager:
```bash
export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p' | head -1)
```
Token tem scopes `repo`, `workflow`, `gist`. Suficiente pra tudo no repo. Falta `read:org` mas não usamos.

Comandos úteis:
```bash
gh run list -R Paulo-Marcos-Lucio/pix-automatico-reference --limit 5 -w CI
gh run watch <run-id> -R Paulo-Marcos-Lucio/pix-automatico-reference --exit-status
gh run view --job <job-id> --log -R Paulo-Marcos-Lucio/pix-automatico-reference
```

## Branch protection

`main` está protegido: status checks `CI status` e `Analyze (Java)` obrigatórios, linear history, sem force push, sem delete. Mudanças entram via PR squash-merged.

## Release

Tag `v*.*.*` dispara `release.yml`: builda imagem OCI, push pra `ghcr.io/Paulo-Marcos-Lucio/pix-automatico-reference`, cria GitHub Release com SBOM CycloneDX e Trivy SARIF.

```bash
git tag v0.2.0
git push origin v0.2.0
```

## Convenções do frontend

- **Stack**: Vite + React 18 + TypeScript + Tailwind + shadcn/ui (Radix primitives) + TanStack Query + React Router
- **Tipos**: `web/src/lib/types.ts` espelha os DTOs do backend manualmente. Quando o contrato mudar, atualiza ambos. Migrar pra `openapi-typescript` (gerar do `/v3/api-docs`) é o caminho longo prazo.
- **API client**: `web/src/lib/api.ts`. Já injeta `Idempotency-Key` UUIDv4 quando `idempotent: true`. Não chamar `fetch` direto nos componentes.
- **Hooks**: TanStack Query em `web/src/hooks/useApi.ts`. Sempre invalidar `queryKey` relevante depois de mutation.
- **Auto-refresh** ativo na página `Charges` e `ChargeDetail` (saga é assíncrona, polling de 3-5s dá feedback ao vivo).
- **Output do build**: `vite.config.ts` aponta pra `../src/main/resources/static`. Esse path é gitignored. NÃO commit dele.
- **Dev mode**: `make web-dev` roda Vite em :5173 com proxy pra :8080. CORS não aparece porque tudo passa pelo Vite.
- **Prod**: `make run` (ou `mvn package`) → frontend-maven-plugin builda → JAR contém SPA → Spring serve.
- **SPA routing**: deep links como `/charges/uuid` precisam do `WebMvcConfig` (em infrastructure/config) que faz fallback pra `/index.html`. Não mexer.

## Fora de escopo (não fazer sem pedido)

- Implementar gateway BCB real (precisa mTLS + ICP-Brasil + credenciais reais — só faz sentido em contexto de cliente)
- Migração Java 25 (plano abandonado em `.github/java-upgrade/`, gitignored)
- Os itens marcados como roadmap no README (DICT, conciliação batch, multi-tenant, chaos testing, Helm, dashboards as code)
- Auth no frontend (mock-only por ora — em prod entraria Keycloak/Cognito + roles)

## Mensagens de commit

PT-BR informal, claro e elucidativo. Mantém o prefixo Conventional Commits (`fix(escopo):`, `feat(escopo):`, `chore:`, `test:`, etc.) mas o texto em português. Explica *o que* mudou e *por quê*. Exemplo bom:

```
fix(domain): permite transição SCHEDULED -> FAILED

Quando o gateway BCB retorna erro 4xx não-recuperável antes do charge
ser iniciado, ChargeSaga chama charge.fail(...). O state machine
proibia essa transição e quebrava a saga. Cobrança que falha pré-
iniciação é uma falha legítima — refletido no state machine.
```

## Memória do harness

Arquivos em `~/.claude/projects/.../memory/` documentam preferências do Paulo (autonomia, comunicação, estrutura do projeto). Atualizar quando aprender algo durável; não duplicar conteúdo do código.
