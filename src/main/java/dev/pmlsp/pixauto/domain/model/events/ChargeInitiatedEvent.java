package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public record ChargeInitiatedEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        String endToEndId) implements DomainEvent {

    public ChargeInitiatedEvent(UUID aggregateId, String endToEndId) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, endToEndId);
    }

    @Override
    public String aggregateType() {
        return "Charge";
    }
}
