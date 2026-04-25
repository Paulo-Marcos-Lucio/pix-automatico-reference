package dev.pmlsp.pixauto.domain.model;

import dev.pmlsp.pixauto.domain.model.events.ChargeInitiatedEvent;
import dev.pmlsp.pixauto.domain.model.events.ChargeScheduledEvent;
import dev.pmlsp.pixauto.domain.model.events.ChargeSettledEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChargeTest {

    @Test
    void schedulingEmitsScheduledEvent() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(),
                Money.brl("10.00"), LocalDate.of(2026, 5, 1));
        assertThat(c.getStatus()).isEqualTo(ChargeStatus.SCHEDULED);
        assertThat(c.pullPendingEvents()).singleElement().isInstanceOf(ChargeScheduledEvent.class);
    }

    @Test
    void initiatingRequiresScheduled() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(),
                Money.brl("10.00"), LocalDate.now());
        c.pullPendingEvents();

        c.initiate(EndToEndId.generate("12345678"));
        assertThat(c.getStatus()).isEqualTo(ChargeStatus.INITIATED);
        assertThat(c.pullPendingEvents()).singleElement().isInstanceOf(ChargeInitiatedEvent.class);

        assertThatThrownBy(() -> c.initiate(EndToEndId.generate("12345678")))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void settlingAfterInitiating() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(),
                Money.brl("10.00"), LocalDate.now());
        c.initiate(EndToEndId.generate("12345678"));
        c.pullPendingEvents();

        Instant now = Instant.now();
        c.settle(now);
        assertThat(c.getStatus()).isEqualTo(ChargeStatus.SETTLED);
        assertThat(c.getSettledAt()).isEqualTo(now);
        assertThat(c.pullPendingEvents()).singleElement().isInstanceOf(ChargeSettledEvent.class);
    }

    @Test
    void cannotSettleWithoutInitiating() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(),
                Money.brl("10.00"), LocalDate.now());
        assertThatThrownBy(() -> c.settle(Instant.now())).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void failingAfterInitiating() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(),
                Money.brl("10.00"), LocalDate.now());
        c.initiate(EndToEndId.generate("12345678"));
        c.pullPendingEvents();

        c.fail("INSUFFICIENT_FUNDS", "saldo indisponivel");
        assertThat(c.getStatus()).isEqualTo(ChargeStatus.FAILED);
        assertThat(c.getErrorCode()).isEqualTo("INSUFFICIENT_FUNDS");
    }
}
