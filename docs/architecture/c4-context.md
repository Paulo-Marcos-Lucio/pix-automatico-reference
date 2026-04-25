# C4 — Nivel 1: Contexto

```mermaid
C4Context
title System Context — Pix Automatico Reference

Person(merchant, "Merchant Backend", "Sistema do cliente (SaaS, ERP, plataforma de assinaturas) que quer cobrar recorrentemente")
Person(consumer, "Consumidor Final", "Pagador que autoriza a recorrencia no app do banco dele")

System(pixauto, "Pix Automatico Reference", "Plataforma que orquestra consents, subscriptions e charges contra o ecossistema Pix Automatico + Open Finance")

System_Ext(bcb, "Banco Central / SPI / Open Finance", "APIs regulatorias que o BC expoe para instituicoes participantes")
System_Ext(payer_bank, "Banco do Pagador", "Onde o consumidor final autoriza e mantem a conta debitada")
System_Ext(payee_bank, "Banco do Recebedor", "Banco que recebe o valor no SPI")

Rel(merchant, pixauto, "Cria consents / subscriptions / charges", "HTTPS / REST")
Rel(pixauto, bcb, "Registra consents, inicia charges", "HTTPS + mTLS + FAPI")
Rel(bcb, pixauto, "Notifica status via webhook", "HTTPS + JWS")
Rel(consumer, payer_bank, "Autoriza recorrencia", "App bancario")
Rel(bcb, payer_bank, "Propaga consents via Open Finance")
Rel(payer_bank, payee_bank, "Liquida via SPI/Pix")
```

## Fluxo macro

1. Merchant cria `Consent` na nossa plataforma.
2. Plataforma registra no BC e marca como `AWAITING_AUTHORIZATION`.
3. Consumidor final autoriza no banco dele (fora de escopo desse sistema). BC notifica a plataforma via webhook -> `AUTHORIZED`.
4. Merchant cria `Subscription` + `Charge` (um por ciclo).
5. Saga dispara `initiateCharge` no BC quando chega a data.
6. BC executa SPI e devolve webhook com `SETTLED` ou `FAILED`.
