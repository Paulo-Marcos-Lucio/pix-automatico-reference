package dev.pmlsp.pixauto.infrastructure.persistence.outbox;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OutboxJpaRepository extends JpaRepository<OutboxJpaEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OutboxJpaEntity o where o.publishedAt is null order by o.createdAt asc")
    List<OutboxJpaEntity> lockUnpublished(Limit limit);
}
