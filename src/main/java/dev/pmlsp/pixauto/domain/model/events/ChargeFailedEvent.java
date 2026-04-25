package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public record ChargeFailedEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        String errorCode,
        String errorMessage) implements DomainEvent {

    public ChargeFailedEvent(UUID aggregateId, String errorCode, String errorMessage) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, errorCode, errorMessage);
    }

    @Override
    public String aggregateType() {
        return "Charge";
    }
}
