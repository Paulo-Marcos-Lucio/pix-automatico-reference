package dev.pmlsp.pixauto.infrastructure.persistence.consent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConsentJpaRepository extends JpaRepository<ConsentJpaEntity, UUID> {
}
