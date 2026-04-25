package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Charge;

import java.util.UUID;

public interface GetChargeUseCase {
    Charge handle(UUID chargeId);
}
