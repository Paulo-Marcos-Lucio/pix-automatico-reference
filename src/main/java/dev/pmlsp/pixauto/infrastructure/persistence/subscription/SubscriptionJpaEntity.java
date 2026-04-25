package dev.pmlsp.pixauto.infrastructure.persistence.subscription;

import dev.pmlsp.pixauto.domain.model.Subscription;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID consentId;

    private String externalReference;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Subscription.Status status;

    private LocalDate lastChargeDate;

    @Column(nullable = false)
    private int chargeCount;

    @Version
    private long version;
}
