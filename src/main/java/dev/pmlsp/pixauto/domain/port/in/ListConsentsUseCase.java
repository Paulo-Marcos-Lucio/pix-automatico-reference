package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Consent;

import java.util.List;

public interface ListConsentsUseCase {
    Result list(int page, int size);

    record Result(List<Consent> items, long total, int page, int size) {}
}
