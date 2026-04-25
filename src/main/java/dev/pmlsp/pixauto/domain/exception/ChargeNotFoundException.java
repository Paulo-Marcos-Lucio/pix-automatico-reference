package dev.pmlsp.pixauto.domain.exception;

import java.util.UUID;

public class ChargeNotFoundException extends DomainException {
    public ChargeNotFoundException(UUID id) {
        super("charge not found: " + id);
    }
}
