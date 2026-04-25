# Contribuindo

Obrigado pelo interesse! Este repositório é uma referência técnica pública — contribuições que melhoram clareza, correção ou aderência ao Pix Automático / Open Finance Brasil são muito bem-vindas.

## Como começar

1. Faça fork e crie um branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-mudanca
   ```
2. Suba a stack local:
   ```bash
   make up
   ```
3. Rode os testes:
   ```bash
   make it
   ```

## Convenções

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>

[corpo opcional explicando o porquê, não o quê]

[footer opcional, ex: Closes #123 / BREAKING CHANGE: ...]
```

Tipos aceitos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `build`.

Exemplos:
```
feat(charge): adiciona retry exponencial para chamadas ao BC
fix(idempotency): corrige race condition em Redis SETNX
docs(adr): atualiza ADR-0003 com lição da migração de outbox
```

### Branches

- `main`: protegida, requer PR + CI verde + 1 review
- `feat/*`, `fix/*`, `refactor/*`, `chore/*`: branches de trabalho

### Estilo de código

- Java 21 — use `var`, records, pattern matching e virtual threads quando fizerem sentido
- Lombok permitido apenas para boilerplate puro (`@Getter`, `@Builder`); evitar `@Data` em entidades
- Domínio (`domain/`) **não pode** importar Spring nem Jakarta — ArchUnit valida no CI
- Nomes em português apenas para conceitos do domínio BCB (`Consent`, `Charge`, `EndToEndId`); resto em inglês

### Testes

Cobertura mínima por tipo de mudança:

| Mudança | Testes obrigatórios |
|---|---|
| Regra de domínio | Unitário no agregado |
| Caso de uso (application) | Unitário com ports mockados |
| Adapter de I/O | Integração via Testcontainers |
| Mudança em controller | Integração HTTP + Pact (quando contrato externo) |
| Nova camada / pacote | ArchUnit atualizado |

Não use mocks para banco, Kafka ou Redis em testes de integração — sempre Testcontainers.

### ADRs

Decisões arquiteturais não triviais devem virar um ADR em `docs/adr/`. Numere sequencialmente e siga o template das ADRs existentes.

## Fluxo de PR

1. CI precisa estar verde (build, unit, integration, ArchUnit, Semgrep, CodeQL, Trivy)
2. Coverage não pode regredir
3. PR description preenchida pelo template
4. Pelo menos 1 aprovação de CODEOWNER
5. Squash merge é o padrão; merge commit apenas para integração de branches longas

## Reportando vulnerabilidades

**Não abra issue pública.** Veja [SECURITY.md](./SECURITY.md).

## Licença

Ao contribuir, você concorda em licenciar suas mudanças sob a [MIT License](./LICENSE).
