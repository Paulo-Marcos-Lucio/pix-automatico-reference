package dev.pmlsp.pixauto.domain.port.in;

import java.util.UUID;

public interface CreateSubscriptionUseCase {
    UUID create(Command command);

    record Command(UUID consentId, String externalReference) {}
}
