package dev.pmlsp.pixauto.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MoneyTest {

    @Test
    void rejectsNegativeAmount() {
        assertThatThrownBy(() -> Money.brl("-1.00"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("negative");
    }

    @Test
    void addsSameCurrency() {
        Money a = Money.brl("10.00");
        Money b = Money.brl("5.50");
        assertThat(a.add(b).amount()).isEqualByComparingTo(new BigDecimal("15.50"));
    }

    @Test
    void rejectsDifferentCurrencyArithmetic() {
        Money brl = Money.brl("10.00");
        Money usd = new Money(new BigDecimal("10.00"), java.util.Currency.getInstance("USD"));
        assertThatThrownBy(() -> brl.add(usd))
                .hasMessageContaining("currency mismatch");
    }
}
