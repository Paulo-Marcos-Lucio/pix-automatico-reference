// Tipos espelhando os DTOs do backend (adapter/web/dto). Manter em sincronia
// quando o contrato mudar — futuro upgrade pode auto-gerar via openapi-typescript
// a partir do swagger publicado em /v3/api-docs.

export type ConsentStatus =
  | "AWAITING_AUTHORIZATION"
  | "AUTHORIZED"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED"
  | "CONSUMED";

export type ChargeStatus = "SCHEDULED" | "INITIATED" | "SETTLED" | "FAILED" | "CANCELLED";

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

export interface ConsentView {
  id: string;
  payerDocument: string;
  payerName: string;
  receiverKeyType: PixKeyType;
  receiverKeyValue: string;
  frequency: Frequency;
  amount: string;
  currency: string;
  firstCharge: string;
  endDate: string | null;
  maxOccurrences: number | null;
  status: ConsentStatus;
  createdAt: string;
  authorizedAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
}

export interface CreateConsentRequest {
  payer: { document: string; name: string };
  receiverKey: { type: PixKeyType; value: string };
  policy: {
    frequency: Frequency;
    amount: string;
    currency: string;
    firstCharge: string;
    endDate?: string | null;
    maxOccurrences?: number | null;
  };
}

export interface CreateConsentResponse {
  consentId: string;
  status: string;
  authorizeUrl: string;
}

export interface SubscriptionView {
  id: string;
  consentId: string;
  externalReference: string | null;
  createdAt: string;
  status: SubscriptionStatus;
  lastChargeDate: string | null;
  chargeCount: number;
}

export interface CreateSubscriptionRequest {
  consentId: string;
  externalReference?: string | null;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  status: string;
}

export interface ChargeView {
  id: string;
  subscriptionId: string;
  consentId: string;
  amount: string;
  currency: string;
  scheduledFor: string;
  status: ChargeStatus;
  endToEndId: string | null;
  initiatedAt: string | null;
  settledAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  attemptCount: number;
}

export interface ScheduleChargeRequest {
  subscriptionId: string;
  amount: string;
  currency: string;
  scheduledFor: string;
}

export interface ScheduleChargeResponse {
  chargeId: string;
  status: ChargeStatus;
  scheduledFor: string;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ProblemResponse {
  status: number;
  detail?: string;
  title?: string;
  type?: string;
  instance?: string;
}
