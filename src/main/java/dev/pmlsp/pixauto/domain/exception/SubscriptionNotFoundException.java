package dev.pmlsp.pixauto.domain.exception;

import java.util.UUID;

public class SubscriptionNotFoundException extends DomainException {
    public SubscriptionNotFoundException(UUID id) {
        super("subscription not found: " + id);
    }
}
