package dev.pmlsp.pixauto.domain.exception;

/**
 * Retryable error from the Banco Central gateway (5xx, timeouts, rate-limits).
 * The saga should retry with exponential backoff.
 */
public class BcbServerException extends RuntimeException {

    public BcbServerException(String message, Throwable cause) {
        super(message, cause);
    }
}
