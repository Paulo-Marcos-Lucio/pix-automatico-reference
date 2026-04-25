package dev.pmlsp.pixauto.domain.port.in;

import java.util.UUID;

public interface AuthorizeConsentUseCase {
    void handle(UUID consentId);
}
