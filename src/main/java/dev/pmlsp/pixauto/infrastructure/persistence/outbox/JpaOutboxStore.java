package dev.pmlsp.pixauto.infrastructure.persistence.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.pmlsp.pixauto.domain.model.events.DomainEvent;
import dev.pmlsp.pixauto.domain.port.out.OutboxStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaOutboxStore implements OutboxStore {

    private final OutboxJpaRepository jpa;
    private final ObjectMapper objectMapper;

    @Override
    public void append(List<DomainEvent> events) {
        if (events.isEmpty()) return;
        for (DomainEvent event : events) {
            jpa.save(OutboxJpaEntity.builder()
                    .eventId(event.eventId())
                    .aggregateType(event.aggregateType())
                    .aggregateId(event.aggregateId())
                    .eventType(event.eventType())
                    .payload(serialize(event))
                    .occurredAt(event.occurredAt())
                    .createdAt(Instant.now())
                    .attempts(0)
                    .build());
        }
    }

    private String serialize(DomainEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("cannot serialize event " + event.eventType(), e);
        }
    }
}
