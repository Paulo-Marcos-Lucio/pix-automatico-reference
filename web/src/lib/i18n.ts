// Tradução PT-BR de termos do domínio para exibição na UI.
// O backend e os tipos da API continuam em inglês (padrão técnico).
// Este módulo é a única ponte entre os enums do contrato e o que o
// usuário lê na tela.

import type {
  ChargeStatus,
  ConsentStatus,
  Frequency,
  PixKeyType,
  SubscriptionStatus,
} from "./types";

export const consentStatusLabel: Record<ConsentStatus, string> = {
  AWAITING_AUTHORIZATION: "Aguardando autorização",
  AUTHORIZED: "Autorizado",
  REJECTED: "Rejeitado",
  REVOKED: "Revogado",
  EXPIRED: "Expirado",
  CONSUMED: "Consumido",
};

export const chargeStatusLabel: Record<ChargeStatus, string> = {
  SCHEDULED: "Agendada",
  INITIATED: "Iniciada",
  SETTLED: "Liquidada",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
};

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const frequencyLabel: Record<Frequency, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
};

export const pixKeyTypeLabel: Record<PixKeyType, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  EVP: "Chave aleatória",
};

export function statusLabel(
  status: ChargeStatus | ConsentStatus | SubscriptionStatus,
): string {
  if (status in consentStatusLabel) {
    return consentStatusLabel[status as ConsentStatus];
  }
  if (status in chargeStatusLabel) {
    return chargeStatusLabel[status as ChargeStatus];
  }
  if (status in subscriptionStatusLabel) {
    return subscriptionStatusLabel[status as SubscriptionStatus];
  }
  return status;
}
