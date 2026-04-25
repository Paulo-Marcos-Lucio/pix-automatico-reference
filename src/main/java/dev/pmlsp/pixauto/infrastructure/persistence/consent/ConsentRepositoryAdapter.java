package dev.pmlsp.pixauto.infrastructure.persistence.consent;

import dev.pmlsp.pixauto.domain.model.*;
import dev.pmlsp.pixauto.domain.port.out.ConsentRepository;
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
public class ConsentRepositoryAdapter implements ConsentRepository {

    private final ConsentJpaRepository jpa;

    @Override
    public Consent save(Consent consent) {
        ConsentJpaEntity entity = toEntity(consent);
        ConsentJpaEntity saved = jpa.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Consent> findById(UUID id) {
        return jpa.findById(id).map(ConsentRepositoryAdapter::toDomain);
    }

    @Override
    public List<Consent> findAll(int page, int size) {
        return jpa.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(ConsentRepositoryAdapter::toDomain)
                .toList();
    }

    @Override
    public long count() {
        return jpa.count();
    }

    private static ConsentJpaEntity toEntity(Consent c) {
        return ConsentJpaEntity.builder()
                .id(c.getId())
                .payerDocument(c.getPayer().document())
                .payerName(c.getPayer().name())
                .receiverKeyType(c.getReceiverKey().type())
                .receiverKeyValue(c.getReceiverKey().value())
                .frequency(c.getPolicy().frequency())
                .amount(c.getPolicy().amount().amount())
                .currency(c.getPolicy().amount().currency().getCurrencyCode())
                .firstCharge(c.getPolicy().firstCharge())
                .endDate(c.getPolicy().endDate())
                .maxOccurrences(c.getPolicy().maxOccurrences())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .authorizedAt(c.getAuthorizedAt())
                .revokedAt(c.getRevokedAt())
                .revocationReason(c.getRevocationReason())
                .version(c.getVersion())
                .build();
    }

    private static Consent toDomain(ConsentJpaEntity e) {
        Money money = new Money(e.getAmount(), Currency.getInstance(e.getCurrency()));
        RecurrencePolicy policy = new RecurrencePolicy(
                e.getFrequency(), money, e.getFirstCharge(), e.getEndDate(), e.getMaxOccurrences());
        return Consent.rehydrate(
                e.getId(),
                new EndUser(e.getPayerDocument(), e.getPayerName()),
                new PixKey(e.getReceiverKeyType(), e.getReceiverKeyValue()),
                policy,
                e.getCreatedAt(),
                e.getStatus(),
                e.getAuthorizedAt(),
                e.getRevokedAt(),
                e.getRevocationReason(),
                e.getVersion());
    }
}
