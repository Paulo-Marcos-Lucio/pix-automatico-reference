package dev.pmlsp.pixauto.domain.port.out;

import java.time.Duration;
import java.util.Optional;

public interface IdempotencyStore {

    /**
     * Attempts to reserve a slot for the given idempotency key + request fingerprint.
     * Returns the previously stored response if the key was already seen with the same fingerprint.
     * Throws {@link IdempotencyConflictException} if the key was seen with a different fingerprint.
     */
    Reservation reserve(String key, String fingerprint, Duration ttl);

    /**
     * Stores the response payload associated with a previously reserved key.
     */
    void commit(String key, String responsePayload, int statusCode);

    /**
     * Releases a reservation that failed before commit (so retry can proceed).
     */
    void release(String key);

    sealed interface Reservation {
        record Fresh(String key) implements Reservation {}
        record Replay(String responsePayload, int statusCode) implements Reservation {}
    }

    class IdempotencyConflictException extends RuntimeException {
        public IdempotencyConflictException(String key) {
            super("idempotency key reused with different fingerprint: " + key);
        }
    }

    Optional<Reservation.Replay> lookup(String key);
}
