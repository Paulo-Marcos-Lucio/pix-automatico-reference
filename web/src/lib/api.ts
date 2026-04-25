import type {
  ChargeView,
  ConsentView,
  CreateConsentRequest,
  CreateConsentResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  PageResponse,
  ProblemResponse,
  ScheduleChargeRequest,
  ScheduleChargeResponse,
  SubscriptionView,
} from "./types";

// Same-origin em produção (servido pelo Spring Boot junto com a API).
// Em dev, o Vite proxy direciona /v1, /webhooks, /actuator pra :8080.
const BASE = "";

function uuid() {
  return (crypto as { randomUUID?: () => string }).randomUUID?.() ?? fallbackUuid();
}

function fallbackUuid() {
  // RFC4122 v4-ish — só pra dev em browsers antigos que não tenham crypto.randomUUID.
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16),
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly problem?: ProblemResponse,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  /** se true, envia header Idempotency-Key UUIDv4 automaticamente */
  idempotent?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, idempotent, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (idempotent) {
    finalHeaders["Idempotency-Key"] = uuid();
  }

  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let problem: ProblemResponse | undefined;
    try {
      problem = (await response.json()) as ProblemResponse;
    } catch {
      // body não é JSON
    }
    const detail =
      problem?.detail ?? problem?.title ?? `${response.status} ${response.statusText}`;
    throw new ApiError(detail, response.status, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ===== Consents =====

export const consentsApi = {
  list: (page = 0, size = 20) =>
    request<PageResponse<ConsentView>>(`/v1/consents?page=${page}&size=${size}`),

  get: (id: string) => request<ConsentView>(`/v1/consents/${id}`),

  create: (input: CreateConsentRequest) =>
    request<CreateConsentResponse>("/v1/consents", {
      method: "POST",
      body: input,
      idempotent: true,
    }),

  authorize: (id: string) =>
    request<void>(`/v1/consents/${id}/authorize`, {
      method: "POST",
      idempotent: true,
    }),

  revoke: (id: string, reason: string) =>
    request<void>(`/v1/consents/${id}/revoke`, {
      method: "POST",
      body: { reason },
      idempotent: true,
    }),
};

// ===== Subscriptions =====

export const subscriptionsApi = {
  list: (page = 0, size = 20) =>
    request<PageResponse<SubscriptionView>>(`/v1/subscriptions?page=${page}&size=${size}`),

  get: (id: string) => request<SubscriptionView>(`/v1/subscriptions/${id}`),

  create: (input: CreateSubscriptionRequest) =>
    request<CreateSubscriptionResponse>("/v1/subscriptions", {
      method: "POST",
      body: input,
      idempotent: true,
    }),
};

// ===== Charges =====

export const chargesApi = {
  list: (page = 0, size = 20) =>
    request<PageResponse<ChargeView>>(`/v1/charges?page=${page}&size=${size}`),

  get: (id: string) => request<ChargeView>(`/v1/charges/${id}`),

  schedule: (input: ScheduleChargeRequest) =>
    request<ScheduleChargeResponse>("/v1/charges", {
      method: "POST",
      body: input,
      idempotent: true,
    }),
};

// ===== Health =====

export interface HealthResponse {
  status: "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";
  components?: Record<string, { status: string }>;
}

export const healthApi = {
  status: () => request<HealthResponse>("/actuator/health"),
};
