package dev.pmlsp.pixauto.domain.model;

import java.util.Set;

public enum ConsentStatus {
    AWAITING_AUTHORIZATION,
    AUTHORIZED,
    REJECTED,
    REVOKED,
    EXPIRED,
    CONSUMED;

    private static final java.util.Map<ConsentStatus, Set<ConsentStatus>> TRANSITIONS = java.util.Map.of(
            AWAITING_AUTHORIZATION, Set.of(AUTHORIZED, REJECTED, EXPIRED),
            AUTHORIZED, Set.of(REVOKED, EXPIRED, CONSUMED),
            REJECTED, Set.of(),
            REVOKED, Set.of(),
            EXPIRED, Set.of(),
            CONSUMED, Set.of());

    public boolean canTransitionTo(ConsentStatus next) {
        return TRANSITIONS.get(this).contains(next);
    }

    public boolean isTerminal() {
        return TRANSITIONS.get(this).isEmpty();
    }
}
