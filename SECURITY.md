# Política de Segurança

## Versões suportadas

Como este é um projeto de referência sob desenvolvimento ativo, **apenas a `main` recebe correções de segurança**. Releases anteriores são marcadas como obsoletas.

| Versão | Suportada |
|---|---|
| `main` (HEAD) | ✅ |
| `v0.x.x` | ⚠️ apenas via novas releases |

## Reportando uma vulnerabilidade

**Não abra issue pública para vulnerabilidades.** Use o canal privado de Security Advisories do GitHub:

👉 https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference/security/advisories/new

Ao reportar, inclua:

- Descrição do problema e impacto potencial
- Passos para reproduzir (PoC se possível)
- Versão / commit afetado
- Sugestão de correção, se houver

### O que esperar

| Etapa | SLA alvo |
|---|---|
| Confirmação de recebimento | até 3 dias úteis |
| Avaliação inicial e severidade | até 7 dias úteis |
| Patch e advisory público | de acordo com a severidade |

Severidade segue [CVSS 3.1](https://www.first.org/cvss/calculator/3.1).

## Escopo

Vulnerabilidades de interesse:

- Injeção (SQL, log, cabeçalho)
- Deserialização insegura
- Bypass de autenticação / autorização
- Exposição de dados sensíveis (PII, tokens, chaves Pix)
- Race conditions em fluxos de idempotência ou saga
- Falhas em validação de webhooks (BCB callback)
- Configurações inseguras de Spring Security / OAuth2
- Dependências vulneráveis com exploit conhecido

Fora de escopo (mas reporte mesmo assim):

- Engenharia social / phishing
- Ataques de negação de serviço (DoS) sem amplificação
- Vulnerabilidades em dependências sem caminho exploitável demonstrado

## Disclosure

Trabalhamos em modelo de **disclosure coordenado**: após o patch, o advisory é publicado com crédito ao reporter (a menos que prefira anonimato).

## Hardening default

Esta implementação já aplica:

- TLS obrigatório em produção (configurar via reverse proxy)
- OAuth2 Client Credentials para chamadas ao BC (simulando mTLS / FAPI)
- Idempotency-Key obrigatório em todos os POSTs com efeito colateral
- Rate limiting via Resilience4j
- Validação de payload via Jakarta Bean Validation
- Logs estruturados sem PII (chaves Pix mascaradas)
- Headers de segurança via Spring Security (`X-Content-Type-Options`, `Strict-Transport-Security`, etc.)
- Dependency scanning contínuo (Dependabot + CodeQL + Trivy)

## Reconhecimentos

Lista de pesquisadores que reportaram vulnerabilidades válidas será mantida em `SECURITY-HALL-OF-FAME.md` (ainda vazio).
