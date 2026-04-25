package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.ChargeDtos;
import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.Money;
import dev.pmlsp.pixauto.domain.port.in.GetChargeUseCase;
import dev.pmlsp.pixauto.domain.port.in.ScheduleChargeUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Currency;
import java.util.UUID;

@RestController
@RequestMapping("/v1/charges")
@RequiredArgsConstructor
public class ChargeController {

    private final ScheduleChargeUseCase scheduleCharge;
    private final GetChargeUseCase getCharge;

    @PostMapping
    public ResponseEntity<ChargeDtos.ScheduleChargeResponse> schedule(
            @Valid @RequestBody ChargeDtos.ScheduleChargeRequest req) {
        Money money = new Money(req.amount(), Currency.getInstance(req.currency()));
        UUID id = scheduleCharge.handle(new ScheduleChargeUseCase.Command(
                req.subscriptionId(), money, req.scheduledFor()));
        return ResponseEntity.created(URI.create("/v1/charges/" + id))
                .body(new ChargeDtos.ScheduleChargeResponse(
                        id, dev.pmlsp.pixauto.domain.model.ChargeStatus.SCHEDULED, req.scheduledFor()));
    }

    @GetMapping("/{id}")
    public ChargeDtos.ChargeView get(@PathVariable UUID id) {
        Charge c = getCharge.handle(id);
        return new ChargeDtos.ChargeView(
                c.getId(), c.getSubscriptionId(), c.getConsentId(),
                c.getAmount().amount(), c.getAmount().currency().getCurrencyCode(),
                c.getScheduledFor(), c.getStatus(),
                c.getEndToEndId() != null ? c.getEndToEndId().value() : null,
                c.getInitiatedAt(), c.getSettledAt(),
                c.getErrorCode(), c.getErrorMessage(), c.getAttemptCount());
    }
}
