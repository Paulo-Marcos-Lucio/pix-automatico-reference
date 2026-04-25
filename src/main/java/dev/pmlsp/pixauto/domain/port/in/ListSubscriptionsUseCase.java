package dev.pmlsp.pixauto.domain.port.in;

import dev.pmlsp.pixauto.domain.model.Subscription;

import java.util.List;

public interface ListSubscriptionsUseCase {
    Result list(int page, int size);

    record Result(List<Subscription> items, long total, int page, int size) {}
}
