package dev.pmlsp.pixauto.domain.port.out;

import dev.pmlsp.pixauto.domain.model.events.DomainEvent;

import java.util.List;

public interface OutboxStore {
    void append(List<DomainEvent> events);
}
