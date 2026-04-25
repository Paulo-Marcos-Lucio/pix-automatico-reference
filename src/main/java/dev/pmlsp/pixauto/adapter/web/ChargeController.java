package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.ChargeDtos;
import dev.pmlsp.pixauto.domain.model.Money;
import dev.pmlsp.pixauto.domain.port.in.GetChargeUseCase;
import dev.pmlsp.pixauto.domain.port.in.ListChargesUseCase;
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
    private final ListChargesUseCase listCharges;

    @PostMapping
    public ResponseEntity<ChargeDtos.ScheduleChargeResponse> schedule(
            @Valid @RequestBody ChargeDtos.ScheduleChargeRequest req) {
        Money money = new Money(req.amount(), Currency.getInstance(req.currency()));
        UUID id = scheduleCharge.schedule(new ScheduleChargeUseCase.Command(
                req.subscriptionId(), money, req.scheduledFor()));
        return ResponseEntity.created(URI.create("/v1/charges/" + id))
                .body(new ChargeDtos.ScheduleChargeResponse(
                        id, dev.pmlsp.pixauto.domain.model.ChargeStatus.SCHEDULED, req.scheduledFor()));
    }

    @GetMapping
    public ChargeDtos.ChargeListResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = listCharges.list(page, size);
        return new ChargeDtos.ChargeListResponse(
                result.items().stream().map(ChargeDtos.ChargeView::from).toList(),
                result.total(),
                result.page(),
                result.size());
    }

    @GetMapping("/{id}")
    public ChargeDtos.ChargeView get(@PathVariable UUID id) {
        return ChargeDtos.ChargeView.from(getCharge.getById(id));
    }
}
