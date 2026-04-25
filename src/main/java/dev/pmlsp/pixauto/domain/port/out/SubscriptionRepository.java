package dev.pmlsp.pixauto.domain.port.out;

import dev.pmlsp.pixauto.domain.model.Subscription;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository {
    Subscription save(Subscription subscription);
    Optional<Subscription> findById(UUID id);
}
