package dev.pmlsp.pixauto.domain.port.in;

import java.time.Instant;
import java.util.UUID;

public interface UpdateChargeStatusUseCase {
    void updateStatus(Command command);

    record Command(UUID chargeId, String endToEndId, Status status, Instant occurredAt,
                   String errorCode, String errorMessage) {
        public enum Status { SETTLED, FAILED }
    }
}
