package dev.pmlsp.pixauto.infrastructure.messaging.outbox;

import dev.pmlsp.pixauto.infrastructure.messaging.kafka.KafkaTopics;
import dev.pmlsp.pixauto.infrastructure.persistence.outbox.OutboxJpaEntity;
import dev.pmlsp.pixauto.infrastructure.persistence.outbox.OutboxJpaRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.springframework.data.domain.Limit;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPublisher {

    private static final int BATCH_SIZE = 100;
    private static final int MAX_ATTEMPTS = 5;

    private final OutboxJpaRepository outbox;
    private final KafkaTemplate<String, String> kafka;
    private final MeterRegistry metrics;

    @Scheduled(fixedDelayString = "${outbox.poll-interval-ms:500}")
    @Transactional
    public void drain() {
        List<OutboxJpaEntity> batch = outbox.lockUnpublished(Limit.of(BATCH_SIZE));
        if (batch.isEmpty()) return;

        log.debug("outbox.drain size={}", batch.size());
        for (OutboxJpaEntity entry : batch) {
            try {
                publish(entry);
                entry.setPublishedAt(Instant.now());
                metrics.counter("outbox.published", "eventType", entry.getEventType()).increment();
            } catch (Exception e) {
                entry.setAttempts(entry.getAttempts() + 1);
                metrics.counter("outbox.failed", "eventType", entry.getEventType()).increment();
                log.error("outbox.publish.failed eventId={} attempts={}", entry.getEventId(), entry.getAttempts(), e);
                if (entry.getAttempts() >= MAX_ATTEMPTS) {
                    log.error("outbox.poison eventId={} dropping after {} attempts",
                            entry.getEventId(), MAX_ATTEMPTS);
                    entry.setPublishedAt(Instant.now());
                }
            }
            outbox.save(entry);
        }
    }

    private void publish(OutboxJpaEntity entry)
            throws ExecutionException, InterruptedException, TimeoutException {
        String topic = KafkaTopics.forAggregate(entry.getAggregateType());
        ProducerRecord<String, String> record = new ProducerRecord<>(
                topic, null, entry.getAggregateId().toString(), entry.getPayload());
        record.headers().add(new RecordHeader("eventType", entry.getEventType().getBytes(StandardCharsets.UTF_8)));
        record.headers().add(new RecordHeader("eventId", entry.getEventId().toString().getBytes(StandardCharsets.UTF_8)));
        record.headers().add(new RecordHeader("aggregateType",
                entry.getAggregateType().getBytes(StandardCharsets.UTF_8)));
        kafka.send(record).get(5, TimeUnit.SECONDS);
    }
}
