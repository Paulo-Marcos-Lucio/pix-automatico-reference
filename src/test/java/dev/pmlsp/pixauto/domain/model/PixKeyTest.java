package dev.pmlsp.pixauto.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PixKeyTest {

    @ParameterizedTest
    @CsvSource({
            "CPF,       12345678901",
            "CNPJ,      12345678000199",
            "EMAIL,     a@b.co",
            "PHONE,     +5511987654321",
            "EVP,       550e8400-e29b-41d4-a716-446655440000"
    })
    void acceptsValidKeys(PixKeyType type, String value) {
        assertThatCode(() -> new PixKey(type, value)).doesNotThrowAnyException();
    }

    @Test
    void rejectsInvalidCpf() {
        assertThatThrownBy(() -> new PixKey(PixKeyType.CPF, "abc"))
                .hasMessageContaining("invalid CPF");
    }

    @Test
    void rejectsInvalidEmail() {
        assertThatThrownBy(() -> new PixKey(PixKeyType.EMAIL, "not-an-email"))
                .hasMessageContaining("invalid EMAIL");
    }
}
