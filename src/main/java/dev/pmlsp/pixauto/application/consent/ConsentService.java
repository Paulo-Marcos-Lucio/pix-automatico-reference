package dev.pmlsp.pixauto.application.consent;

import dev.pmlsp.pixauto.domain.exception.ConsentNotFoundException;
import dev.pmlsp.pixauto.domain.model.Consent;
import dev.pmlsp.pixauto.domain.port.in.AuthorizeConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.CreateConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.GetConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.ListConsentsUseCase;
import dev.pmlsp.pixauto.domain.port.in.RevokeConsentUseCase;
import dev.pmlsp.pixauto.domain.port.out.ConsentRepository;
import dev.pmlsp.pixauto.domain.port.out.OutboxStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsentService implements
        CreateConsentUseCase, GetConsentUseCase,
        AuthorizeConsentUseCase, RevokeConsentUseCase,
        ListConsentsUseCase {

    private final ConsentRepository consents;
    private final OutboxStore outbox;

    @Override
    @Transactional
    public UUID create(CreateConsentUseCase.Command cmd) {
        Consent consent = Consent.create(cmd.payer(), cmd.receiverKey(), cmd.policy());
        consents.save(consent);
        log.info("consent.created id={} payer={}", consent.getId(), mask(cmd.payer().document()));
        return consent.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Consent getById(UUID consentId) {
        return consents.findById(consentId).orElseThrow(() -> new ConsentNotFoundException(consentId));
    }

    @Override
    @Transactional
    public void authorize(UUID consentId) {
        Consent consent = consents.findById(consentId).orElseThrow(() -> new ConsentNotFoundException(consentId));
        consent.authorize();
        consents.save(consent);
        outbox.append(consent.pullPendingEvents());
        log.info("consent.authorized id={}", consentId);
    }

    @Override
    @Transactional
    public void revoke(UUID consentId, String reason) {
        Consent consent = consents.findById(consentId).orElseThrow(() -> new ConsentNotFoundException(consentId));
        consent.revoke(reason);
        consents.save(consent);
        outbox.append(consent.pullPendingEvents());
        log.info("consent.revoked id={} reason={}", consentId, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public ListConsentsUseCase.Result list(int page, int size) {
        return new ListConsentsUseCase.Result(
                consents.findAll(page, size),
                consents.count(),
                page,
                size);
    }

    private static String mask(String document) {
        if (document == null || document.length() < 4) return "***";
        return document.substring(0, 3) + "***" + document.substring(document.length() - 2);
    }
}
