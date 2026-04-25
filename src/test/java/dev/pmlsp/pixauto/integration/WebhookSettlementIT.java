package dev.pmlsp.pixauto.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que um webhook do BCB com status SETTLED transiciona o Charge
 * de INITIATED para SETTLED — o caminho feliz da conciliação assíncrona.
 *
 * Pré-requisito: pixauto.bcb.simulated.failure-rate=0.0 e retryable-rate=0.0
 * em application-test.yml, garantindo que a saga sempre alcança INITIATED.
 */
class WebhookSettlementIT extends AbstractIntegrationIT {

    @LocalServerPort
    int port;

    @Autowired
    ObjectMapper objectMapper;

    private RestClient client() {
        return RestClient.builder().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void webhookSettledTransitionsChargeToSettled() throws Exception {
        // 1. cria consent
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
        UUID consentId = UUID.fromString(objectMapper.readTree(created.getBody()).get("consentId").asText());

        // 2. autoriza
        client().post()
                .uri("/v1/consents/" + consentId + "/authorize")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .retrieve()
                .toBodilessEntity();

        // 3. cria subscription
        ResponseEntity<String> subResp = client().post()
                .uri("/v1/subscriptions")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(Map.of(
                        "consentId", consentId.toString(),
                        "externalReference", "invoice-webhook-test")))
                .retrieve()
                .toEntity(String.class);
        UUID subscriptionId = UUID.fromString(objectMapper.readTree(subResp.getBody()).get("subscriptionId").asText());

        // 4. agenda charge
        ResponseEntity<String> chargeResp = client().post()
                .uri("/v1/charges")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(Map.of(
                        "subscriptionId", subscriptionId.toString(),
                        "amount", "99.90",
                        "currency", "BRL",
                        "scheduledFor", LocalDate.now().toString())))
                .retrieve()
                .toEntity(String.class);
        UUID chargeId = UUID.fromString(objectMapper.readTree(chargeResp.getBody()).get("chargeId").asText());

        // 5. espera saga iniciar (SCHEDULED -> INITIATED) e captura o endToEndId
        String[] endToEndId = new String[1];
        Awaitility.await()
                .atMost(Duration.ofSeconds(15))
                .pollInterval(Duration.ofMillis(500))
                .untilAsserted(() -> {
                    JsonNode view = objectMapper.readTree(client().get()
                            .uri("/v1/charges/" + chargeId)
                            .retrieve()
                            .toEntity(String.class)
                            .getBody());
                    assertThat(view.get("status").asText()).isEqualTo("INITIATED");
                    assertThat(view.has("endToEndId")).isTrue();
                    assertThat(view.get("endToEndId").isNull()).isFalse();
                    endToEndId[0] = view.get("endToEndId").asText();
                });

        // 6. dispara o webhook do BCB sinalizando liquidação
        ResponseEntity<Void> webhookResp = client().post()
                .uri("/webhooks/bcb/charge-status")
                .contentType(MediaType.APPLICATION_JSON)
                .body(objectMapper.writeValueAsString(Map.of(
                        "chargeId", chargeId.toString(),
                        "endToEndId", endToEndId[0],
                        "status", "SETTLED",
                        "occurredAt", Instant.now().toString())))
                .retrieve()
                .toBodilessEntity();
        assertThat(webhookResp.getStatusCode().value()).isEqualTo(202);

        // 7. confirma transição final pra SETTLED
        Awaitility.await()
                .atMost(Duration.ofSeconds(10))
                .pollInterval(Duration.ofMillis(500))
                .untilAsserted(() -> {
                    JsonNode view = objectMapper.readTree(client().get()
                            .uri("/v1/charges/" + chargeId)
                            .retrieve()
                            .toEntity(String.class)
                            .getBody());
                    assertThat(view.get("status").asText()).isEqualTo("SETTLED");
                });
    }
}
