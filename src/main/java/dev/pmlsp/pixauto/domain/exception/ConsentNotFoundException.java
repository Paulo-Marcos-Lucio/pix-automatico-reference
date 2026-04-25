package dev.pmlsp.pixauto.domain.exception;

import java.util.UUID;

public class ConsentNotFoundException extends DomainException {
    public ConsentNotFoundException(UUID id) {
        super("consent not found: " + id);
    }
}
