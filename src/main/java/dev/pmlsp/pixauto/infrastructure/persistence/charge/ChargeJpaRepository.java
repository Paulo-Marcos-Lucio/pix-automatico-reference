package dev.pmlsp.pixauto.infrastructure.persistence.charge;

import dev.pmlsp.pixauto.domain.model.ChargeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChargeJpaRepository extends JpaRepository<ChargeJpaEntity, UUID> {
    List<ChargeJpaEntity> findBySubscriptionIdAndStatus(UUID subscriptionId, ChargeStatus status);
}
