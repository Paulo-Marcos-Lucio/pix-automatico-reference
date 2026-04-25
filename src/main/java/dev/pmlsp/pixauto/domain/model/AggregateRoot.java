package dev.pmlsp.pixauto.domain.model;

import dev.pmlsp.pixauto.domain.model.events.DomainEvent;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class AggregateRoot {

    private final List<DomainEvent> pendingEvents = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        pendingEvents.add(event);
    }

    public List<DomainEvent> pullPendingEvents() {
        List<DomainEvent> snapshot = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return snapshot;
    }

    public List<DomainEvent> peekPendingEvents() {
        return Collections.unmodifiableList(pendingEvents);
    }
}
