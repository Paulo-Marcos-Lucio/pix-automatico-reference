package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.EndUser;
import dev.pmlsp.pixauto.domain.model.PixKey;
import dev.pmlsp.pixauto.domain.model.RecurrencePolicy;

import java.util.UUID;

public interface CreateConsentUseCase {
    UUID create(Command command);

    record Command(EndUser payer, PixKey receiverKey, RecurrencePolicy policy) {}
}
