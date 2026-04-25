package dev.pmlsp.pixauto.adapter.web.dto;

import dev.pmlsp.pixauto.domain.model.ConsentStatus;
import dev.pmlsp.pixauto.domain.model.PixKeyType;
import dev.pmlsp.pixauto.domain.model.RecurrencePolicy;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class ConsentDtos {

    private ConsentDtos() {}

    public record CreateConsentRequest(
            @NotNull @Valid PayerDto payer,
            @NotNull @Valid ReceiverKeyDto receiverKey,
            @NotNull @Valid PolicyDto policy) {}

    public record PayerDto(
            @NotBlank String document,
            @NotBlank String name) {}

    public record ReceiverKeyDto(
            @NotNull PixKeyType type,
            @NotBlank String value) {}

    public record PolicyDto(
            @NotNull RecurrencePolicy.Frequency frequency,
            @NotNull @Positive BigDecimal amount,
            @NotBlank String currency,
            @NotNull @FutureOrPresent LocalDate firstCharge,
            @Future LocalDate endDate,
            @Positive Integer maxOccurrences) {}

    public record CreateConsentResponse(UUID consentId, String status, String authorizeUrl) {}

    public record ConsentView(
            UUID id,
            String payerDocument,
            String payerName,
            PixKeyType receiverKeyType,
            String receiverKeyValue,
            RecurrencePolicy.Frequency frequency,
            BigDecimal amount,
            String currency,
            LocalDate firstCharge,
            LocalDate endDate,
            Integer maxOccurrences,
            ConsentStatus status,
            Instant createdAt,
            Instant authorizedAt,
            Instant revokedAt,
            String revocationReason) {}

    public record ConsentListResponse(
            List<ConsentView> items,
            long total,
            int page,
            int size) {}

    public record RevokeConsentRequest(@NotBlank String reason) {}
}
