package dev.pmlsp.pixauto.adapter.web.dto;

import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.ChargeStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class ChargeDtos {

    private ChargeDtos() {}

    public record ScheduleChargeRequest(
            @NotNull UUID subscriptionId,
            @NotNull @Positive BigDecimal amount,
            @NotBlank String currency,
            @NotNull @FutureOrPresent LocalDate scheduledFor) {}

    public record ScheduleChargeResponse(UUID chargeId, ChargeStatus status, LocalDate scheduledFor) {}

    public record ChargeView(
            UUID id,
            UUID subscriptionId,
            UUID consentId,
            BigDecimal amount,
            String currency,
            LocalDate scheduledFor,
            ChargeStatus status,
            String endToEndId,
            Instant initiatedAt,
            Instant settledAt,
            String errorCode,
            String errorMessage,
            int attemptCount) {

        public static ChargeView from(Charge c) {
            return new ChargeView(
                    c.getId(),
                    c.getSubscriptionId(),
                    c.getConsentId(),
                    c.getAmount().amount(),
                    c.getAmount().currency().getCurrencyCode(),
                    c.getScheduledFor(),
                    c.getStatus(),
                    c.getEndToEndId() != null ? c.getEndToEndId().value() : null,
                    c.getInitiatedAt(),
                    c.getSettledAt(),
                    c.getErrorCode(),
                    c.getErrorMessage(),
                    c.getAttemptCount());
        }
    }

    public record ChargeListResponse(
            List<ChargeView> items,
            long total,
            int page,
            int size) {}
}
