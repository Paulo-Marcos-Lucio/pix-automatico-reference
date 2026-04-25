package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Money;

import java.time.LocalDate;
import java.util.UUID;

public interface ScheduleChargeUseCase {
    UUID handle(Command command);

    record Command(UUID subscriptionId, Money amount, LocalDate scheduledFor) {}
}
