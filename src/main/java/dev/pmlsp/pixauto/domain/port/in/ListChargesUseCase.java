package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Charge;

import java.util.List;

public interface ListChargesUseCase {
    Result list(int page, int size);

    record Result(List<Charge> items, long total, int page, int size) {}
}
