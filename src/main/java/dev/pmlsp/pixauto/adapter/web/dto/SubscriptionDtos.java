package dev.pmlsp.pixauto.adapter.web.dto;

import dev.pmlsp.pixauto.domain.model.Subscription;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class SubscriptionDtos {

    private SubscriptionDtos() {}

    public record CreateSubscriptionRequest(
            @NotNull UUID consentId,
            String externalReference) {}

    public record CreateSubscriptionResponse(UUID subscriptionId, String status) {}

    public record SubscriptionView(
            UUID id,
            UUID consentId,
            String externalReference,
            Instant createdAt,
            Subscription.Status status,
            LocalDate lastChargeDate,
            int chargeCount) {

        public static SubscriptionView from(Subscription s) {
            return new SubscriptionView(
                    s.getId(),
                    s.getConsentId(),
                    s.getExternalReference(),
                    s.getCreatedAt(),
                    s.getStatus(),
                    s.getLastChargeDate(),
                    s.getChargeCount());
        }
    }

    public record SubscriptionListResponse(
            List<SubscriptionView> items,
            long total,
            int page,
            int size) {}
}
