package dev.pmlsp.pixauto.infrastructure.messaging.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.pmlsp.pixauto.application.charge.ChargeSaga;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChargeScheduledListener {

    private final ChargeSaga saga;
    private final ObjectMapper objectMapper;
    private final MeterRegistry metrics;

    @KafkaListener(
            topics = KafkaTopics.CHARGE_EVENTS,
            groupId = "pixauto.charge-saga",
            concurrency = "${kafka.consumer.charge-saga.concurrency:3}")
    public void onChargeEvent(ConsumerRecord<String, String> record) {
        String eventType = header(record, "eventType");
        if (!"ChargeScheduledEvent".equals(eventType)) {
            return;
        }
        try {
            JsonNode payload = objectMapper.readTree(record.value());
            UUID chargeId = UUID.fromString(payload.get("aggregateId").asText());
            saga.onChargeScheduled(chargeId);
            metrics.counter("saga.charge.handled", "outcome", "ok").increment();
        } catch (Exception e) {
            metrics.counter("saga.charge.handled", "outcome", "error").increment();
            log.error("saga.charge.handle.failed record={}", record, e);
            throw new RuntimeException(e);
        }
    }

    private static String header(ConsumerRecord<?, ?> record, String name) {
        var header = record.headers().lastHeader(name);
        return header == null ? null : new String(header.value());
    }
}
