package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public record ConsentRevokedEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        String reason) implements DomainEvent {

    public ConsentRevokedEvent(UUID aggregateId, String reason) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, reason);
    }

    @Override
    public String aggregateType() {
        return "Consent";
    }
}
