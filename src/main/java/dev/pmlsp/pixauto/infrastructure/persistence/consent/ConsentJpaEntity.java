package dev.pmlsp.pixauto.infrastructure.persistence.consent;

import dev.pmlsp.pixauto.domain.model.ConsentStatus;
import dev.pmlsp.pixauto.domain.model.RecurrencePolicy;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 14)
    private String payerDocument;

    @Column(nullable = false)
    private String payerName;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private dev.pmlsp.pixauto.domain.model.PixKeyType receiverKeyType;

    @Column(nullable = false)
    private String receiverKeyValue;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RecurrencePolicy.Frequency frequency;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private LocalDate firstCharge;

    private LocalDate endDate;

    private Integer maxOccurrences;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private ConsentStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant authorizedAt;
    private Instant revokedAt;
    private String revocationReason;

    @Version
    private long version;
}
