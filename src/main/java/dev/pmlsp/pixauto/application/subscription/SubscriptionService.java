package dev.pmlsp.pixauto.application.subscription;

import dev.pmlsp.pixauto.domain.exception.ConsentNotAuthorizedException;
import dev.pmlsp.pixauto.domain.exception.ConsentNotFoundException;
import dev.pmlsp.pixauto.domain.model.Consent;
import dev.pmlsp.pixauto.domain.model.Subscription;
import dev.pmlsp.pixauto.domain.port.in.CreateSubscriptionUseCase;
import dev.pmlsp.pixauto.domain.port.out.ConsentRepository;
import dev.pmlsp.pixauto.domain.port.out.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService implements CreateSubscriptionUseCase {

    private final SubscriptionRepository subscriptions;
    private final ConsentRepository consents;

    @Override
    @Transactional
    public UUID handle(Command cmd) {
        Consent consent = consents.findById(cmd.consentId())
                .orElseThrow(() -> new ConsentNotFoundException(cmd.consentId()));
        if (!consent.isAuthorized()) {
            throw new ConsentNotAuthorizedException(consent.getId(), consent.getStatus());
        }
        Subscription sub = Subscription.create(cmd.consentId(), cmd.externalReference());
        subscriptions.save(sub);
        log.info("subscription.created id={} consentId={}", sub.getId(), cmd.consentId());
        return sub.getId();
    }
}
