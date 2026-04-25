package dev.pmlsp.pixauto.domain.exception;

/**
 * Non-retryable error from the Banco Central gateway (4xx other than rate-limit).
 * The charge should be marked FAILED and the saga should not retry.
 */
public class BcbClientException extends RuntimeException {

    private final String errorCode;

    public BcbClientException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String errorCode() {
        return errorCode;
    }
}
