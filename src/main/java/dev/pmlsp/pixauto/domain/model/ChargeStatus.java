package dev.pmlsp.pixauto.domain.model;

import java.util.Set;

public enum ChargeStatus {
    SCHEDULED,
    INITIATED,
    SETTLED,
    FAILED,
    CANCELLED;

    private static final java.util.Map<ChargeStatus, Set<ChargeStatus>> TRANSITIONS = java.util.Map.of(
            SCHEDULED, Set.of(INITIATED, CANCELLED),
            INITIATED, Set.of(SETTLED, FAILED),
            SETTLED, Set.of(),
            FAILED, Set.of(),
            CANCELLED, Set.of());

    public boolean canTransitionTo(ChargeStatus next) {
        return TRANSITIONS.get(this).contains(next);
    }

    public boolean isTerminal() {
        return TRANSITIONS.get(this).isEmpty();
    }
}
