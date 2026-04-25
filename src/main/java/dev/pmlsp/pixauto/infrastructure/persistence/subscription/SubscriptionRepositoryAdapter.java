package dev.pmlsp.pixauto.infrastructure.persistence.subscription;

import dev.pmlsp.pixauto.domain.model.Subscription;
import dev.pmlsp.pixauto.domain.port.out.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SubscriptionRepositoryAdapter implements SubscriptionRepository {

    private final SubscriptionJpaRepository jpa;

    @Override
    public Subscription save(Subscription s) {
        SubscriptionJpaEntity entity = SubscriptionJpaEntity.builder()
                .id(s.getId())
                .consentId(s.getConsentId())
                .externalReference(s.getExternalReference())
                .createdAt(s.getCreatedAt())
                .status(s.getStatus())
                .lastChargeDate(s.getLastChargeDate())
                .chargeCount(s.getChargeCount())
                .version(s.getVersion())
                .build();
        SubscriptionJpaEntity saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Subscription> findById(UUID id) {
        return jpa.findById(id).map(SubscriptionRepositoryAdapter::toDomain);
    }

    private static Subscription toDomain(SubscriptionJpaEntity e) {
        return Subscription.rehydrate(
                e.getId(),
                e.getConsentId(),
                e.getExternalReference(),
                e.getCreatedAt(),
                e.getStatus(),
                e.getLastChargeDate(),
                e.getChargeCount(),
                e.getVersion());
    }
}
