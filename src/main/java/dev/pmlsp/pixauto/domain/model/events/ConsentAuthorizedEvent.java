package dev.pmlsp.pixauto.domain.model.events;

import java.time.Instant;
import java.util.UUID;

public record ConsentAuthorizedEvent(
        UUID eventId,
        Instant occurredAt,
        UUID aggregateId,
        String payerDocument,
        String receiverPixKey) implements DomainEvent {

    public ConsentAuthorizedEvent(UUID aggregateId, String payerDocument, String receiverPixKey) {
        this(UUID.randomUUID(), Instant.now(), aggregateId, payerDocument, receiverPixKey);
    }

    @Override
    public String aggregateType() {
        return "Consent";
    }
}
