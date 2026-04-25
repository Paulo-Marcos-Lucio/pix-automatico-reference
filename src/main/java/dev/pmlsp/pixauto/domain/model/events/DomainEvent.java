package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public sealed interface DomainEvent
        permits ConsentAuthorizedEvent, ConsentRevokedEvent,
                ChargeScheduledEvent, ChargeInitiatedEvent,
                ChargeSettledEvent, ChargeFailedEvent {

    UUID eventId();

    Instant occurredAt();

    String aggregateType();

    UUID aggregateId();

    default String eventType() {
        return this.getClass().getSimpleName();
    }
}
