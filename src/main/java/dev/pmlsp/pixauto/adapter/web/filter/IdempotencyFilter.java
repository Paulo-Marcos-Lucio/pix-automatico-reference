package dev.pmlsp.pixauto.adapter.web.filter;

import dev.pmlsp.pixauto.application.idempotency.IdempotencyService;
import dev.pmlsp.pixauto.domain.port.out.IdempotencyStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

/**
 * Enforces idempotency for POST endpoints when the {@code Idempotency-Key} header is present.
 * The request body is cached once and replayed to downstream handlers so the fingerprint
 * covers the full payload without breaking servlet input consumption.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String HEADER = "Idempotency-Key";
    private static final Set<String> IDEMPOTENT_METHODS = Set.of("POST");
    private static final Set<String> PROTECTED_PATH_PREFIXES = Set.of(
            "/v1/consents", "/v1/subscriptions", "/v1/charges");

    private final IdempotencyService idempotency;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        if (!IDEMPOTENT_METHODS.contains(req.getMethod()) || !isProtected(req.getRequestURI())) {
            chain.doFilter(req, res);
            return;
        }

        String key = req.getHeader(HEADER);
        if (key == null || key.isBlank()) {
            writeProblem(res, HttpServletResponse.SC_BAD_REQUEST,
                    "Idempotency-Key header required for " + req.getRequestURI());
            return;
        }
        if (!isValidUuid(key)) {
            writeProblem(res, HttpServletResponse.SC_BAD_REQUEST, "Idempotency-Key must be a UUID");
            return;
        }

        byte[] bodyBytes = req.getInputStream().readAllBytes();
        CachedBodyHttpServletRequest wrappedReq = new CachedBodyHttpServletRequest(req, bodyBytes);
        ContentCachingResponseWrapper wrappedRes = new ContentCachingResponseWrapper(res);

        String fingerprintInput = req.getMethod() + " " + req.getRequestURI() + "\n"
                + new String(bodyBytes, StandardCharsets.UTF_8);

        IdempotencyStore.Reservation reservation;
        try {
            reservation = idempotency.reserve(key, fingerprintInput);
        } catch (IdempotencyStore.IdempotencyConflictException e) {
            writeProblem(res, HttpServletResponse.SC_CONFLICT, e.getMessage());
            return;
        }

        if (reservation instanceof IdempotencyStore.Reservation.Replay replay) {
            log.debug("idempotency.replay key={} status={}", key, replay.statusCode());
            res.setStatus(replay.statusCode());
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.setHeader("Idempotency-Replayed", "true");
            if (replay.responsePayload() != null) {
                res.getWriter().write(replay.responsePayload());
            }
            return;
        }

        try {
            chain.doFilter(wrappedReq, wrappedRes);
            int status = wrappedRes.getStatus();
            String responseBody = new String(wrappedRes.getContentAsByteArray(), StandardCharsets.UTF_8);
            if (status >= 200 && status < 300) {
                idempotency.commit(key, responseBody, status);
            } else {
                idempotency.release(key);
            }
            wrappedRes.copyBodyToResponse();
        } catch (Exception e) {
            idempotency.release(key);
            throw e;
        }
    }

    private static boolean isProtected(String uri) {
        return PROTECTED_PATH_PREFIXES.stream().anyMatch(uri::startsWith);
    }

    private static boolean isValidUuid(String s) {
        try {
            UUID.fromString(s);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static void writeProblem(HttpServletResponse res, int status, String detail) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.getWriter().write("{\"status\":" + status + ",\"detail\":\"" + detail.replace("\"", "\\\"") + "\"}");
    }
}
