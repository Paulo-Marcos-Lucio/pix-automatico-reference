package dev.pmlsp.pixauto.domain.exception;

import dev.pmlsp.pixauto.domain.model.ConsentStatus;

import java.util.UUID;

public class ConsentNotAuthorizedException extends DomainException {
    public ConsentNotAuthorizedException(UUID consentId, ConsentStatus actual) {
        super("consent %s is %s, not AUTHORIZED".formatted(consentId, actual));
    }
}
