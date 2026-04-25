package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Consent;

import java.util.UUID;

public interface GetConsentUseCase {
    Consent getById(UUID consentId);
}
