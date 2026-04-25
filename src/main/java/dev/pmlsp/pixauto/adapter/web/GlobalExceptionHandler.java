package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.domain.exception.ChargeNotFoundException;
import dev.pmlsp.pixauto.domain.exception.ConsentNotAuthorizedException;
import dev.pmlsp.pixauto.domain.exception.ConsentNotFoundException;
import dev.pmlsp.pixauto.domain.exception.SubscriptionNotFoundException;
import dev.pmlsp.pixauto.domain.port.out.IdempotencyStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ConsentNotFoundException.class, ChargeNotFoundException.class, SubscriptionNotFoundException.class})
    public ProblemDetail notFound(RuntimeException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        pd.setType(URI.create("https://pixauto/errors/not-found"));
        pd.setDetail(e.getMessage());
        return pd;
    }

    @ExceptionHandler(ConsentNotAuthorizedException.class)
    public ProblemDetail consentNotAuthorized(ConsentNotAuthorizedException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setType(URI.create("https://pixauto/errors/consent-not-authorized"));
        pd.setDetail(e.getMessage());
        return pd;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail illegalState(IllegalStateException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setType(URI.create("https://pixauto/errors/invalid-state-transition"));
        pd.setDetail(e.getMessage());
        return pd;
    }

    @ExceptionHandler(IdempotencyStore.IdempotencyConflictException.class)
    public ProblemDetail idempotencyConflict(IdempotencyStore.IdempotencyConflictException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setType(URI.create("https://pixauto/errors/idempotency-conflict"));
        pd.setDetail(e.getMessage());
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validation(MethodArgumentNotValidException e) {
        String details = e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setType(URI.create("https://pixauto/errors/validation"));
        pd.setTitle("Validation failed");
        pd.setDetail(details);
        return pd;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail illegalArgument(IllegalArgumentException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setDetail(e.getMessage());
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception e) {
        log.error("unexpected.error", e);
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setDetail("internal error");
        return pd;
    }
}
