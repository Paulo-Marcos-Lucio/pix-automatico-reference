package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Subscription;

import java.util.UUID;

public interface GetSubscriptionUseCase {
    Subscription getById(UUID subscriptionId);
}
