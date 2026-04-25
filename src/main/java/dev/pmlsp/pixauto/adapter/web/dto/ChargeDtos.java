package dev.pmlsp.pixauto.adapter.web.dto;

import dev.pmlsp.pixauto.domain.model.ChargeStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
            int attemptCount) {}
}
