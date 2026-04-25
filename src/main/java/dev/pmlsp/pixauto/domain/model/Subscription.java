package dev.pmlsp.pixauto.domain.model;

import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Getter
public class Subscription {

    public enum Status { ACTIVE, PAUSED, COMPLETED, CANCELLED }

    private final UUID id;
    private final UUID consentId;
    private final String externalReference;
    private final Instant createdAt;
    private Status status;
    private LocalDate lastChargeDate;
    private int chargeCount;
    private long version;

    private Subscription(UUID id, UUID consentId, String externalReference, Instant createdAt,
                         Status status, LocalDate lastChargeDate, int chargeCount, long version) {
        this.id = Objects.requireNonNull(id);
        this.consentId = Objects.requireNonNull(consentId);
        this.externalReference = externalReference;
        this.createdAt = Objects.requireNonNull(createdAt);
        this.status = Objects.requireNonNull(status);
        this.lastChargeDate = lastChargeDate;
        this.chargeCount = chargeCount;
        this.version = version;
    }

    public static Subscription create(UUID consentId, String externalReference) {
        return new Subscription(UUID.randomUUID(), consentId, externalReference,
                Instant.now(), Status.ACTIVE, null, 0, 0L);
    }

    public static Subscription rehydrate(UUID id, UUID consentId, String externalReference,
                                         Instant createdAt, Status status, LocalDate lastChargeDate,
                                         int chargeCount, long version) {
        return new Subscription(id, consentId, externalReference, createdAt, status,
                lastChargeDate, chargeCount, version);
    }

    public void registerCharge(LocalDate chargeDate) {
        if (status != Status.ACTIVE) {
            throw new IllegalStateException("subscription not active: " + status);
        }
        this.lastChargeDate = chargeDate;
        this.chargeCount++;
        this.version++;
    }

    public void pause() {
        if (status == Status.ACTIVE) {
            this.status = Status.PAUSED;
            this.version++;
        }
    }

    public void resume() {
        if (status == Status.PAUSED) {
            this.status = Status.ACTIVE;
            this.version++;
        }
    }

    public void cancel() {
        if (status != Status.COMPLETED && status != Status.CANCELLED) {
            this.status = Status.CANCELLED;
            this.version++;
        }
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.version++;
    }
}
