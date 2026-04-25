import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chargesApi, consentsApi, healthApi, subscriptionsApi } from "@/lib/api";
import type {
  CreateConsentRequest,
  CreateSubscriptionRequest,
  ScheduleChargeRequest,
} from "@/lib/types";

// ===== Consents =====

export function useConsents(page = 0, size = 20) {
  return useQuery({
    queryKey: ["consents", page, size],
    queryFn: () => consentsApi.list(page, size),
  });
}

export function useConsent(id: string | undefined) {
  return useQuery({
    queryKey: ["consents", id],
    queryFn: () => consentsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConsentRequest) => consentsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents"] });
    },
  });
}

export function useAuthorizeConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => consentsApi.authorize(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents"] });
    },
  });
}

export function useRevokeConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => consentsApi.revoke(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents"] });
    },
  });
}

// ===== Subscriptions =====

export function useSubscriptions(page = 0, size = 20) {
  return useQuery({
    queryKey: ["subscriptions", page, size],
    queryFn: () => subscriptionsApi.list(page, size),
  });
}

export function useSubscription(id: string | undefined) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => subscriptionsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionRequest) => subscriptionsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

// ===== Charges =====

export function useCharges(page = 0, size = 20) {
  return useQuery({
    queryKey: ["charges", page, size],
    queryFn: () => chargesApi.list(page, size),
    refetchInterval: 5_000, // saga é assíncrona — auto-refresh dá feedback ao vivo
  });
}

export function useCharge(id: string | undefined) {
  return useQuery({
    queryKey: ["charges", id],
    queryFn: () => chargesApi.get(id!),
    enabled: !!id,
    refetchInterval: 3_000,
  });
}

export function useScheduleCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleChargeRequest) => chargesApi.schedule(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charges"] });
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

// ===== Health =====

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => healthApi.status(),
    refetchInterval: 30_000,
    retry: false,
  });
}
