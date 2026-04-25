package dev.pmlsp.pixauto.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Verifica o contrato HTTP do header Idempotency-Key descrito no README:
 * - Ausente em POST protegido → 400
 * - Não-UUID → 400
 * - Mesma key + payload divergente → 409
 * - Mesma key + mesmo payload → replay com header Idempotency-Replayed: true
 */
class IdempotencyContractIT extends AbstractIntegrationIT {

    @LocalServerPort
    int port;

    @Autowired
    ObjectMapper objectMapper;

    private RestClient client() {
        return RestClient.builder().baseUrl("http://localhost:" + port).build();
    }

    private String validConsentBody() throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "payer", Map.of("document", "12345678901", "name", "Alice"),
                "receiverKey", Map.of("type", "EMAIL", "value", "bob@merchant.com"),
                "policy", Map.of(
                        "frequency", "MONTHLY",
                        "amount", "99.90",
                        "currency", "BRL",
                        "firstCharge", LocalDate.now().plusDays(1).toString(),
                        "maxOccurrences", 12)));
    }

    @Test
    void rejectsPostWithoutIdempotencyKey() throws Exception {
        String body = validConsentBody();
        assertThatThrownBy(() -> client().post()
                .uri("/v1/consents")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity())
                .isInstanceOfSatisfying(HttpClientErrorException.class, ex -> {
                    assertThat(ex.getStatusCode().value()).isEqualTo(400);
                    assertThat(ex.getResponseBodyAsString()).contains("Idempotency-Key");
                });
    }

    @Test
    void rejectsNonUuidIdempotencyKey() throws Exception {
        String body = validConsentBody();
        assertThatThrownBy(() -> client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", "not-a-uuid")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity())
                .isInstanceOfSatisfying(HttpClientErrorException.class, ex -> {
                    assertThat(ex.getStatusCode().value()).isEqualTo(400);
                    assertThat(ex.getResponseBodyAsString()).contains("UUID");
                });
    }

    @Test
    void rejectsSameKeyWithDivergentPayload() throws Exception {
        String key = UUID.randomUUID().toString();
        String firstBody = validConsentBody();
        String secondBody = objectMapper.writeValueAsString(Map.of(
                "payer", Map.of("document", "98765432100", "name", "Carol"),
                "receiverKey", Map.of("type", "EMAIL", "value", "different@merchant.com"),
                "policy", Map.of(
                        "frequency", "WEEKLY",
                        "amount", "50.00",
                        "currency", "BRL",
                        "firstCharge", LocalDate.now().plusDays(7).toString(),
                        "maxOccurrences", 4)));

        ResponseEntity<String> first = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(firstBody)
                .retrieve()
                .toEntity(String.class);
        assertThat(first.getStatusCode().is2xxSuccessful()).isTrue();

        assertThatThrownBy(() -> client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(secondBody)
                .retrieve()
                .toBodilessEntity())
                .isInstanceOfSatisfying(HttpClientErrorException.class, ex ->
                        assertThat(ex.getStatusCode().value()).isEqualTo(409));
    }

    @Test
    void replayReturnsHeaderAndSameBody() throws Exception {
        String key = UUID.randomUUID().toString();
        String body = validConsentBody();

        ResponseEntity<String> first = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> replay = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        assertThat(replay.getBody()).isEqualTo(first.getBody());
        assertThat(replay.getHeaders().getFirst("Idempotency-Replayed")).isEqualTo("true");
    }
}
