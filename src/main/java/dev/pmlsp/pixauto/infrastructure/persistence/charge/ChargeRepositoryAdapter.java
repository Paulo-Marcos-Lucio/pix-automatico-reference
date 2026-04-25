package dev.pmlsp.pixauto.infrastructure.persistence.charge;

import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.ChargeStatus;
import dev.pmlsp.pixauto.domain.model.EndToEndId;
import dev.pmlsp.pixauto.domain.model.Money;
import dev.pmlsp.pixauto.domain.port.out.ChargeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.Currency;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ChargeRepositoryAdapter implements ChargeRepository {

    private final ChargeJpaRepository jpa;

    @Override
    public Charge save(Charge charge) {
        ChargeJpaEntity entity = ChargeJpaEntity.builder()
                .id(charge.getId())
                .subscriptionId(charge.getSubscriptionId())
                .consentId(charge.getConsentId())
                .amount(charge.getAmount().amount())
                .currency(charge.getAmount().currency().getCurrencyCode())
                .scheduledFor(charge.getScheduledFor())
                .createdAt(charge.getCreatedAt())
                .status(charge.getStatus())
                .endToEndId(charge.getEndToEndId() != null ? charge.getEndToEndId().value() : null)
                .initiatedAt(charge.getInitiatedAt())
                .settledAt(charge.getSettledAt())
                .errorCode(charge.getErrorCode())
                .errorMessage(charge.getErrorMessage())
                .attemptCount(charge.getAttemptCount())
                .version(charge.getVersion())
                .build();
        return toDomain(jpa.save(entity));
    }

    @Override
    public Optional<Charge> findById(UUID id) {
        return jpa.findById(id).map(ChargeRepositoryAdapter::toDomain);
    }

    @Override
    public List<Charge> findBySubscriptionIdAndStatus(UUID subscriptionId, ChargeStatus status) {
        return jpa.findBySubscriptionIdAndStatus(subscriptionId, status).stream()
                .map(ChargeRepositoryAdapter::toDomain)
                .toList();
    }

    @Override
    public List<Charge> findAll(int page, int size) {
        return jpa.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(ChargeRepositoryAdapter::toDomain)
                .toList();
    }

    @Override
    public long count() {
        return jpa.count();
    }

    private static Charge toDomain(ChargeJpaEntity e) {
        return Charge.rehydrate(
                e.getId(),
                e.getSubscriptionId(),
                e.getConsentId(),
                new Money(e.getAmount(), Currency.getInstance(e.getCurrency())),
                e.getScheduledFor(),
                e.getCreatedAt(),
                e.getStatus(),
                e.getEndToEndId() != null ? new EndToEndId(e.getEndToEndId()) : null,
                e.getInitiatedAt(),
                e.getSettledAt(),
                e.getErrorCode(),
                e.getErrorMessage(),
                e.getAttemptCount(),
                e.getVersion());
    }
}
