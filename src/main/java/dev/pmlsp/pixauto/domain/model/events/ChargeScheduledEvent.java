package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ChargeScheduledEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        UUID subscriptionId,
        UUID consentId,
        LocalDate scheduledFor) implements DomainEvent {

    public ChargeScheduledEvent(UUID aggregateId, UUID subscriptionId, UUID consentId, LocalDate scheduledFor) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, subscriptionId, consentId, scheduledFor);
    }

    @Override
    public String aggregateType() {
        return "Charge";
    }
}
