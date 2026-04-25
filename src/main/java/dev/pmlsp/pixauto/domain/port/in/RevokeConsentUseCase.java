package dev.pmlsp.pixauto.domain.port.in;

import java.util.UUID;

public interface RevokeConsentUseCase {
    void revoke(UUID consentId, String reason);
}
