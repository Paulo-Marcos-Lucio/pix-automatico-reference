package dev.pmlsp.pixauto.infrastructure.messaging.kafka;

public final class KafkaTopics {
    public static final String CONSENT_EVENTS = "pixauto.consent.events.v1";
    public static final String CHARGE_EVENTS = "pixauto.charge.events.v1";

    private KafkaTopics() {}

    public static String forAggregate(String aggregateType) {
        return switch (aggregateType) {
            case "Consent" -> CONSENT_EVENTS;
            case "Charge" -> CHARGE_EVENTS;
            default -> throw new IllegalArgumentException("unknown aggregate type: " + aggregateType);
        };
    }
}
