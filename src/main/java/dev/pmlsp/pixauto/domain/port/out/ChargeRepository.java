package dev.pmlsp.pixauto.domain.port.out;

import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.ChargeStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChargeRepository {
    Charge save(Charge charge);
    Optional<Charge> findById(UUID id);
    List<Charge> findBySubscriptionIdAndStatus(UUID subscriptionId, ChargeStatus status);
}
