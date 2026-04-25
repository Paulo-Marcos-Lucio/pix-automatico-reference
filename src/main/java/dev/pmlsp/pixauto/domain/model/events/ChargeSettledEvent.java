package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public record ChargeSettledEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        String endToEndId,
        Instant settledAt) implements DomainEvent {

    public ChargeSettledEvent(UUID aggregateId, String endToEndId, Instant settledAt) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, endToEndId, settledAt);
    }

    @Override
    public String aggregateType() {
        return "Charge";
    }
}
