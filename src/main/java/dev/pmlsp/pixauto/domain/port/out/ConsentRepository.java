package dev.pmlsp.pixauto.domain.port.out;

import dev.pmlsp.pixauto.domain.model.Consent;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsentRepository {
    Consent save(Consent consent);
    Optional<Consent> findById(UUID id);
    List<Consent> findAll(int page, int size);
    long count();
}
