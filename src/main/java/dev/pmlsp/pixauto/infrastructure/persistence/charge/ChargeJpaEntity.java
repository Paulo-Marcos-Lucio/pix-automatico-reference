package dev.pmlsp.pixauto.infrastructure.persistence.charge;

import dev.pmlsp.pixauto.domain.model.ChargeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "charges", indexes = {
        @Index(name = "idx_charges_sub_status", columnList = "subscriptionId,status"),
        @Index(name = "idx_charges_e2eid", columnList = "endToEndId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargeJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID subscriptionId;

    @Column(nullable = false)
    private UUID consentId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private LocalDate scheduledFor;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ChargeStatus status;

    @Column(length = 32)
    private String endToEndId;

    private Instant initiatedAt;
    private Instant settledAt;

    @Column(length = 64)
    private String errorCode;

    @Column(length = 500)
    private String errorMessage;

    @Column(nullable = false)
    private int attemptCount;

    @Version
    private long version;
}
