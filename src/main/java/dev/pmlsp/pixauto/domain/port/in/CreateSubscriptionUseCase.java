package dev.pmlsp.pixauto.domain.port.in;

import java.util.UUID;

public interface CreateSubscriptionUseCase {
    UUID handle(Command command);

    record Command(UUID consentId, String externalReference) {}
}
