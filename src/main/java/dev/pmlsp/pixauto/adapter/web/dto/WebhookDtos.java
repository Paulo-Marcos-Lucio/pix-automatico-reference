package dev.pmlsp.pixauto.adapter.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public final class WebhookDtos {

    private WebhookDtos() {}

    public record ChargeStatusUpdate(
            @NotNull UUID chargeId,
            @NotBlank String endToEndId,
            @NotNull Status status,
            @NotNull Instant occurredAt,
            String errorCode,
            String errorMessage) {
        public enum Status { SETTLED, FAILED }
    }
}
