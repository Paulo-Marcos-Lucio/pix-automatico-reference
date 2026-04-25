package dev.pmlsp.pixauto.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ConsentLifecycleIT extends AbstractIntegrationIT {

    @LocalServerPort
    int port;

    @Autowired
    ObjectMapper objectMapper;

    private RestClient client() {
        return RestClient.builder().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void fullConsentAndChargeFlow() throws Exception {
        var consentBody = Map.of(
                "payer", Map.of("document", "12345678901", "name", "Alice"),
                "receiverKey", Map.of("type", "EMAIL", "value", "bob@merchant.com"),
                "policy", Map.of(
                        "frequency", "MONTHLY",
                        "amount", "99.90",
                        "currency", "BRL",
                        "firstCharge", LocalDate.now().plusDays(1).toString(),
                        "maxOccurrences", 12));

        ResponseEntity<String> created = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(consentBody))
                .retrieve()
                .toEntity(String.class);

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        JsonNode consent = objectMapper.readTree(created.getBody());
        UUID consentId = UUID.fromString(consent.get("consentId").asText());

        client().post()
                .uri("/v1/consents/" + consentId + "/authorize")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .retrieve()
                .toBodilessEntity();

        var subBody = Map.of("consentId", consentId.toString(), "externalReference", "invoice-42");
        ResponseEntity<String> subResp = client().post()
                .uri("/v1/subscriptions")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(subBody))
                .retrieve()
                .toEntity(String.class);

        UUID subscriptionId = UUID.fromString(objectMapper.readTree(subResp.getBody()).get("subscriptionId").asText());

        var chargeBody = Map.of(
                "subscriptionId", subscriptionId.toString(),
                "amount", "99.90",
                "currency", "BRL",
                "scheduledFor", LocalDate.now().toString());
        ResponseEntity<String> chargeResp = client().post()
                .uri("/v1/charges")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(chargeBody))
                .retrieve()
                .toEntity(String.class);

        UUID chargeId = UUID.fromString(objectMapper.readTree(chargeResp.getBody()).get("chargeId").asText());

        Awaitility.await()
                .atMost(Duration.ofSeconds(15))
                .pollInterval(Duration.ofMillis(500))
                .untilAsserted(() -> {
                    ResponseEntity<String> view = client().get()
                            .uri("/v1/charges/" + chargeId)
                            .retrieve()
                            .toEntity(String.class);
                    String status = objectMapper.readTree(view.getBody()).get("status").asText();
                    assertThat(status).isIn("INITIATED", "SETTLED", "FAILED");
                });
    }

    @Test
    void idempotencyReplaysSameResponse() throws Exception {
        String key = UUID.randomUUID().toString();
        var body = objectMapper.writeValueAsString(Map.of(
                "payer", Map.of("document", "12345678901", "name", "Alice"),
                "receiverKey", Map.of("type", "EMAIL", "value", "bob@merchant.com"),
                "policy", Map.of("frequency", "MONTHLY", "amount", "99.90", "currency", "BRL",
                        "firstCharge", LocalDate.now().plusDays(1).toString(), "maxOccurrences", 12)));

        ResponseEntity<String> first = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> second = client().post()
                .uri("/v1/consents")
                .header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        assertThat(first.getBody()).isEqualTo(second.getBody());
        assertThat(second.getHeaders().getFirst("Idempotency-Replayed")).isEqualTo("true");
    }
}
