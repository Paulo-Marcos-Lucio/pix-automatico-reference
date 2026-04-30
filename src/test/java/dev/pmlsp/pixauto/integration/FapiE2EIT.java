package dev.pmlsp.pixauto.integration;

import dev.pmlsp.pixauto.security.DPoPHelper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end FAPI flow against the live Spring context with profile {@code fapi}
 * active (merged with the parent's {@code test} profile via inheritance):
 * receiver requests a sender-constrained access token from the in-process mock
 * auth server, then uses it (with a fresh DPoP proof) to call protected
 * Open Finance recurring-payment endpoints.
 * <p>
 * Wire shape mirrors what a real Open Finance Brasil receiver SDK would use
 * against a transmissor enforcing FAPI 2.0 + DPoP RFC 9449.
 */
@ActiveProfiles("fapi")
class FapiE2EIT extends AbstractIntegrationIT {

    @LocalServerPort
    int port;

    private RestTemplate http() {
        return new RestTemplateBuilder().build();
    }

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private String consentsUrl() {
        return baseUrl() + "/v1/consents";
    }

    @Test
    void receiverGetsBoundTokenAndPassesFilter() {
        DPoPHelper dpop = new DPoPHelper();

        // 1) PISP receiver requests access token from mock auth, presenting DPoP proof
        String tokenUrl = baseUrl() + "/mock-auth/token";
        String tokenProof = dpop.sign("POST", tokenUrl);

        HttpHeaders tokenReqHeaders = new HttpHeaders();
        tokenReqHeaders.set("DPoP", tokenProof);
        tokenReqHeaders.set("X-Client-Id", "demo-receiver");

        ResponseEntity<Map> tokenResponse = http().exchange(tokenUrl, HttpMethod.POST,
                new HttpEntity<>(null, tokenReqHeaders), Map.class);
        assertTrue(tokenResponse.getStatusCode().is2xxSuccessful());
        @SuppressWarnings("unchecked")
        Map<String, Object> tokenBody = tokenResponse.getBody();
        assertNotNull(tokenBody);
        String accessToken = (String) tokenBody.get("access_token");
        assertNotNull(accessToken);
        assertEquals("DPoP", tokenBody.get("token_type"));
        assertEquals("recurring-payments", tokenBody.get("scope"));

        // 2) Receiver calls protected endpoint with bound token + fresh proof.
        //    Status MUST NOT be 401 — controller / downstream filters may still reject
        //    for business reasons (missing fields, invalid body) but the DPoP filter
        //    has authenticated the request.
        String consentProof = dpop.sign("POST", consentsUrl());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "DPoP " + accessToken);
        headers.set("DPoP", consentProof);
        headers.set("Idempotency-Key", UUID.randomUUID().toString());

        Map<String, Object> body = Map.of(
                "loggedUser", Map.of("name", "Fulano",
                        "document", "12345678901", "documentType", "CPF"),
                "creditor", Map.of("ispb", "60746948", "issuer", "0001",
                        "number", "00012345-6", "type", "CACC"),
                "amount", "75.50",
                "currency", "BRL");

        HttpStatusCode observedStatus;
        try {
            ResponseEntity<Map> r = http().exchange(consentsUrl(), HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);
            observedStatus = r.getStatusCode();
        } catch (HttpStatusCodeException e) {
            observedStatus = e.getStatusCode();
        }
        final HttpStatusCode finalStatus = observedStatus;
        assertNotEquals(HttpStatus.UNAUTHORIZED, finalStatus,
                () -> "DPoP filter should have authenticated the request (got " + finalStatus + ")");
    }

    @Test
    void requestWithoutDpopHeadersIsRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", UUID.randomUUID().toString());

        Map<String, Object> body = Map.of(
                "loggedUser", Map.of("name", "X", "document", "12345678901", "documentType", "CPF"),
                "creditor", Map.of("ispb", "60746948", "issuer", "0001", "number", "1", "type", "CACC"),
                "amount", "1.00",
                "currency", "BRL");

        try {
            http().exchange(consentsUrl(), HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            assertNotNull(e.getResponseHeaders().getFirst("WWW-Authenticate"));
            return;
        }
        throw new AssertionError("expected 401");
    }

    @Test
    void replayedTokenFromAnotherKeyIsRejected() {
        DPoPHelper attacker = new DPoPHelper();
        DPoPHelper victim = new DPoPHelper();

        // Victim legitimately obtains a token bound to their key
        String tokenUrl = baseUrl() + "/mock-auth/token";
        HttpHeaders th = new HttpHeaders();
        th.set("DPoP", victim.sign("POST", tokenUrl));
        ResponseEntity<Map> r = http().exchange(tokenUrl, HttpMethod.POST,
                new HttpEntity<>(null, th), Map.class);
        @SuppressWarnings("unchecked")
        String stolenToken = (String) r.getBody().get("access_token");
        assertNotNull(stolenToken);

        // Attacker tries to use the stolen token with their own DPoP proof
        HttpHeaders attackHeaders = new HttpHeaders();
        attackHeaders.setContentType(MediaType.APPLICATION_JSON);
        attackHeaders.set("Authorization", "DPoP " + stolenToken);
        attackHeaders.set("DPoP", attacker.sign("POST", consentsUrl()));
        attackHeaders.set("Idempotency-Key", UUID.randomUUID().toString());

        Map<String, Object> body = Map.of(
                "loggedUser", Map.of("name", "X", "document", "12345678901", "documentType", "CPF"),
                "creditor", Map.of("ispb", "60746948", "issuer", "0001", "number", "1", "type", "CACC"),
                "amount", "1.00",
                "currency", "BRL");

        try {
            http().exchange(consentsUrl(), HttpMethod.POST,
                    new HttpEntity<>(body, attackHeaders), Map.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            String www = e.getResponseHeaders().getFirst("WWW-Authenticate");
            assertNotNull(www);
            assertTrue(www.contains("invalid_token"), () -> "got: " + www);
            return;
        }
        throw new AssertionError("expected 401 due to thumbprint mismatch");
    }
}
