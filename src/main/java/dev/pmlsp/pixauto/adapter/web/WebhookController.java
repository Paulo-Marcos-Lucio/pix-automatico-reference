package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.WebhookDtos;
import dev.pmlsp.pixauto.domain.port.in.UpdateChargeStatusUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/webhooks/bcb")
@RequiredArgsConstructor
public class WebhookController {

    private final UpdateChargeStatusUseCase updateChargeStatus;

    @PostMapping("/charge-status")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void chargeStatus(@Valid @RequestBody WebhookDtos.ChargeStatusUpdate update) {
        log.info("webhook.charge-status received chargeId={} status={}",
                update.chargeId(), update.status());
        UpdateChargeStatusUseCase.Command.Status mapped = switch (update.status()) {
            case SETTLED -> UpdateChargeStatusUseCase.Command.Status.SETTLED;
            case FAILED -> UpdateChargeStatusUseCase.Command.Status.FAILED;
        };
        updateChargeStatus.handle(new UpdateChargeStatusUseCase.Command(
                update.chargeId(), update.endToEndId(), mapped, update.occurredAt(),
                update.errorCode(), update.errorMessage()));
    }
}
