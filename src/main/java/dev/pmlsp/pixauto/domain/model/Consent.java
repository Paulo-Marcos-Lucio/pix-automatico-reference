package dev.pmlsp.pixauto.domain.model;

import dev.pmlsp.pixauto.domain.model.events.ConsentAuthorizedEvent;
import dev.pmlsp.pixauto.domain.model.events.ConsentRevokedEvent;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
public class Consent extends AggregateRoot {

    private final UUID id;
    private final EndUser payer;
    private final PixKey receiverKey;
    private final RecurrencePolicy policy;
    private final Instant createdAt;
    private ConsentStatus status;
    private Instant authorizedAt;
    private Instant revokedAt;
    private String revocationReason;
    private long version;

    private Consent(UUID id, EndUser payer, PixKey receiverKey, RecurrencePolicy policy,
                    Instant createdAt, ConsentStatus status, Instant authorizedAt,
                    Instant revokedAt, String revocationReason, long version) {
        this.id = Objects.requireNonNull(id);
        this.payer = Objects.requireNonNull(payer);
        this.receiverKey = Objects.requireNonNull(receiverKey);
        this.policy = Objects.requireNonNull(policy);
        this.createdAt = Objects.requireNonNull(createdAt);
        this.status = Objects.requireNonNull(status);
        this.authorizedAt = authorizedAt;
        this.revokedAt = revokedAt;
        this.revocationReason = revocationReason;
        this.version = version;
    }

    public static Consent create(EndUser payer, PixKey receiverKey, RecurrencePolicy policy) {
        return new Consent(
                UUID.randomUUID(), payer, receiverKey, policy,
                Instant.now(), ConsentStatus.AWAITING_AUTHORIZATION,
                null, null, null, 0L);
    }

    public static Consent rehydrate(UUID id, EndUser payer, PixKey receiverKey, RecurrencePolicy policy,
                                    Instant createdAt, ConsentStatus status, Instant authorizedAt,
                                    Instant revokedAt, String revocationReason, long version) {
        return new Consent(id, payer, receiverKey, policy, createdAt, status,
                authorizedAt, revokedAt, revocationReason, version);
    }

    public void authorize() {
        requireTransition(ConsentStatus.AUTHORIZED);
        this.status = ConsentStatus.AUTHORIZED;
        this.authorizedAt = Instant.now();
        this.version++;
        registerEvent(new ConsentAuthorizedEvent(id, payer.document(), receiverKey.value()));
    }

    public void revoke(String reason) {
        requireTransition(ConsentStatus.REVOKED);
        this.status = ConsentStatus.REVOKED;
        this.revokedAt = Instant.now();
        this.revocationReason = reason;
        this.version++;
        registerEvent(new ConsentRevokedEvent(id, reason));
    }

    public void markExpired() {
        if (status.isTerminal()) return;
        requireTransition(ConsentStatus.EXPIRED);
        this.status = ConsentStatus.EXPIRED;
        this.version++;
    }

    public boolean isAuthorized() {
        return status == ConsentStatus.AUTHORIZED;
    }

    private void requireTransition(ConsentStatus next) {
        if (!status.canTransitionTo(next)) {
            throw new IllegalStateException(
                    "cannot transition %s -> %s".formatted(status, next));
        }
    }
}
