package dev.pmlsp.pixauto.domain.model;

import dev.pmlsp.pixauto.domain.model.events.ChargeFailedEvent;
import dev.pmlsp.pixauto.domain.model.events.ChargeInitiatedEvent;
import dev.pmlsp.pixauto.domain.model.events.ChargeScheduledEvent;
import dev.pmlsp.pixauto.domain.model.events.ChargeSettledEvent;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Getter
public class Charge extends AggregateRoot {

    private final UUID id;
    private final UUID subscriptionId;
    private final UUID consentId;
    private final Money amount;
    private final LocalDate scheduledFor;
    private final Instant createdAt;
    private ChargeStatus status;
    private EndToEndId endToEndId;
    private Instant initiatedAt;
    private Instant settledAt;
    private String errorCode;
    private String errorMessage;
    private int attemptCount;
    private long version;

    private Charge(UUID id, UUID subscriptionId, UUID consentId, Money amount, LocalDate scheduledFor,
                   Instant createdAt, ChargeStatus status, EndToEndId endToEndId,
                   Instant initiatedAt, Instant settledAt, String errorCode, String errorMessage,
                   int attemptCount, long version) {
        this.id = Objects.requireNonNull(id);
        this.subscriptionId = Objects.requireNonNull(subscriptionId);
        this.consentId = Objects.requireNonNull(consentId);
        this.amount = Objects.requireNonNull(amount);
        this.scheduledFor = Objects.requireNonNull(scheduledFor);
        this.createdAt = Objects.requireNonNull(createdAt);
        this.status = Objects.requireNonNull(status);
        this.endToEndId = endToEndId;
        this.initiatedAt = initiatedAt;
        this.settledAt = settledAt;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.attemptCount = attemptCount;
        this.version = version;
    }

    public static Charge schedule(UUID subscriptionId, UUID consentId, Money amount, LocalDate scheduledFor) {
        Charge c = new Charge(UUID.randomUUID(), subscriptionId, consentId, amount, scheduledFor,
                Instant.now(), ChargeStatus.SCHEDULED, null, null, null, null, null, 0, 0L);
        c.registerEvent(new ChargeScheduledEvent(c.id, subscriptionId, consentId, scheduledFor));
        return c;
    }

    public static Charge rehydrate(UUID id, UUID subscriptionId, UUID consentId, Money amount,
                                   LocalDate scheduledFor, Instant createdAt, ChargeStatus status,
                                   EndToEndId endToEndId, Instant initiatedAt, Instant settledAt,
                                   String errorCode, String errorMessage, int attemptCount, long version) {
        return new Charge(id, subscriptionId, consentId, amount, scheduledFor, createdAt, status,
                endToEndId, initiatedAt, settledAt, errorCode, errorMessage, attemptCount, version);
    }

    public void initiate(EndToEndId e2e) {
        requireTransition(ChargeStatus.INITIATED);
        this.status = ChargeStatus.INITIATED;
        this.endToEndId = Objects.requireNonNull(e2e);
        this.initiatedAt = Instant.now();
        this.attemptCount++;
        registerEvent(new ChargeInitiatedEvent(id, e2e.value()));
    }

    public void settle(Instant settledAt) {
        requireTransition(ChargeStatus.SETTLED);
        this.status = ChargeStatus.SETTLED;
        this.settledAt = Objects.requireNonNull(settledAt);
        registerEvent(new ChargeSettledEvent(id, endToEndId != null ? endToEndId.value() : null, settledAt));
    }

    public void fail(String code, String message) {
        requireTransition(ChargeStatus.FAILED);
        this.status = ChargeStatus.FAILED;
        this.errorCode = code;
        this.errorMessage = message;
        registerEvent(new ChargeFailedEvent(id, code, message));
    }

    public void cancel() {
        requireTransition(ChargeStatus.CANCELLED);
        this.status = ChargeStatus.CANCELLED;
    }

    public boolean isTerminal() {
        return status.isTerminal();
    }

    private void requireTransition(ChargeStatus next) {
        if (!status.canTransitionTo(next)) {
            throw new IllegalStateException(
                    "cannot transition %s -> %s (charge %s)".formatted(status, next, id));
        }
    }
}
