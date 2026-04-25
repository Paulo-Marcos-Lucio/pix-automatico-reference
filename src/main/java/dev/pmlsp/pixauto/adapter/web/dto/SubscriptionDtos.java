package dev.pmlsp.pixauto.adapter.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public final class SubscriptionDtos {

    private SubscriptionDtos() {}

    public record CreateSubscriptionRequest(
            @NotNull UUID consentId,
            String externalReference) {}

    public record CreateSubscriptionResponse(UUID subscriptionId, String status) {}
}
