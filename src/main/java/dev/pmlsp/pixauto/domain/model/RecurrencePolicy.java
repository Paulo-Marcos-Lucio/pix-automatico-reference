package dev.pmlsp.pixauto.domain.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public record RecurrencePolicy(
        Frequency frequency,
        Money amount,
        LocalDate firstCharge,
        LocalDate endDate,
        Integer maxOccurrences) {

    public RecurrencePolicy {
        Objects.requireNonNull(frequency, "frequency");
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(firstCharge, "firstCharge");
        if (!amount.isPositive()) {
            throw new IllegalArgumentException("amount must be positive");
        }
        if (endDate != null && endDate.isBefore(firstCharge)) {
            throw new IllegalArgumentException("endDate before firstCharge");
        }
        if (maxOccurrences != null && maxOccurrences <= 0) {
            throw new IllegalArgumentException("maxOccurrences must be > 0");
        }
    }

    public LocalDate nextChargeAfter(LocalDate last) {
        return switch (frequency) {
            case DAILY -> last.plus(1, ChronoUnit.DAYS);
            case WEEKLY -> last.plus(1, ChronoUnit.WEEKS);
            case MONTHLY -> last.plus(1, ChronoUnit.MONTHS);
            case QUARTERLY -> last.plus(3, ChronoUnit.MONTHS);
            case YEARLY -> last.plus(1, ChronoUnit.YEARS);
        };
    }

    public enum Frequency { DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY }
}
