package dev.pmlsp.pixauto.application.idempotency;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class IdempotencyServiceTest {

    @Test
    void fingerprintIsDeterministic() {
        String a = IdempotencyService.fingerprint("{\"foo\":\"bar\"}");
        String b = IdempotencyService.fingerprint("{\"foo\":\"bar\"}");
        assertThat(a).isEqualTo(b);
    }

    @Test
    void fingerprintChangesWithPayload() {
        String a = IdempotencyService.fingerprint("{\"foo\":\"bar\"}");
        String b = IdempotencyService.fingerprint("{\"foo\":\"baz\"}");
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void fingerprintHandlesNull() {
        assertThat(IdempotencyService.fingerprint(null)).isNotBlank();
    }
}
