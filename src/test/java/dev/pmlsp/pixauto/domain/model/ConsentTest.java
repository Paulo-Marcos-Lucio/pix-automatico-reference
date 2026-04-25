package dev.pmlsp.pixauto.domain.model;

import dev.pmlsp.pixauto.domain.model.events.ConsentAuthorizedEvent;
import dev.pmlsp.pixauto.domain.model.events.ConsentRevokedEvent;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ConsentTest {

    private Consent newConsent() {
        return Consent.create(
                new EndUser("12345678901", "Alice"),
                new PixKey(PixKeyType.EMAIL, "bob@merchant.com"),
                new RecurrencePolicy(RecurrencePolicy.Frequency.MONTHLY,
                        Money.brl("99.90"), LocalDate.of(2026, 5, 1), null, 12));
    }

    @Test
    void startsAwaitingAuthorization() {
        Consent c = newConsent();
        assertThat(c.getStatus()).isEqualTo(ConsentStatus.AWAITING_AUTHORIZATION);
        assertThat(c.peekPendingEvents()).isEmpty();
    }

    @Test
    void authorizingEmitsEvent() {
        Consent c = newConsent();
        c.authorize();
        assertThat(c.isAuthorized()).isTrue();
        assertThat(c.pullPendingEvents()).singleElement().isInstanceOf(ConsentAuthorizedEvent.class);
    }

    @Test
    void cannotAuthorizeTwice() {
        Consent c = newConsent();
        c.authorize();
        assertThatThrownBy(c::authorize).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void canRevokeFromAuthorized() {
        Consent c = newConsent();
        c.authorize();
        c.pullPendingEvents();
        c.revoke("user request");
        assertThat(c.getStatus()).isEqualTo(ConsentStatus.REVOKED);
        assertThat(c.pullPendingEvents()).singleElement().isInstanceOf(ConsentRevokedEvent.class);
    }

    @Test
    void cannotRevokeWithoutAuthorization() {
        Consent c = newConsent();
        assertThatThrownBy(() -> c.revoke("nope")).isInstanceOf(IllegalStateException.class);
    }
}
