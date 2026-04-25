package dev.pmlsp.pixauto.application.idempotency;

import dev.pmlsp.pixauto.domain.port.out.IdempotencyStore;
import dev.pmlsp.pixauto.domain.port.out.IdempotencyStore.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final Duration DEFAULT_TTL = Duration.ofHours(24);

    private final IdempotencyStore store;

    public Reservation reserve(String key, String requestBody) {
        String fingerprint = fingerprint(requestBody);
        return store.reserve(key, fingerprint, DEFAULT_TTL);
    }

    public void commit(String key, String responseBody, int statusCode) {
        store.commit(key, responseBody, statusCode);
    }

    public void release(String key) {
        store.release(key);
    }

    public static String fingerprint(String body) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(body == null ? new byte[0] : body.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
