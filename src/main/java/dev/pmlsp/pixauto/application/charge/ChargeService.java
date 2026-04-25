package dev.pmlsp.pixauto.application.charge;

import dev.pmlsp.pixauto.domain.exception.ChargeNotFoundException;
import dev.pmlsp.pixauto.domain.exception.ConsentNotAuthorizedException;
import dev.pmlsp.pixauto.domain.exception.ConsentNotFoundException;
import dev.pmlsp.pixauto.domain.exception.SubscriptionNotFoundException;
import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.Consent;
import dev.pmlsp.pixauto.domain.model.Subscription;
import dev.pmlsp.pixauto.domain.port.in.GetChargeUseCase;
import dev.pmlsp.pixauto.domain.port.in.ListChargesUseCase;
import dev.pmlsp.pixauto.domain.port.in.ScheduleChargeUseCase;
import dev.pmlsp.pixauto.domain.port.in.UpdateChargeStatusUseCase;
import dev.pmlsp.pixauto.domain.port.out.ChargeRepository;
import dev.pmlsp.pixauto.domain.port.out.ConsentRepository;
import dev.pmlsp.pixauto.domain.port.out.OutboxStore;
import dev.pmlsp.pixauto.domain.port.out.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChargeService implements
        ScheduleChargeUseCase, GetChargeUseCase, UpdateChargeStatusUseCase, ListChargesUseCase {

    private final ChargeRepository charges;
    private final SubscriptionRepository subscriptions;
    private final ConsentRepository consents;
    private final OutboxStore outbox;

    @Override
    @Transactional
    public UUID schedule(ScheduleChargeUseCase.Command cmd) {
        Subscription sub = subscriptions.findById(cmd.subscriptionId())
                .orElseThrow(() -> new SubscriptionNotFoundException(cmd.subscriptionId()));
        Consent consent = consents.findById(sub.getConsentId())
                .orElseThrow(() -> new ConsentNotFoundException(sub.getConsentId()));
        if (!consent.isAuthorized()) {
            throw new ConsentNotAuthorizedException(consent.getId(), consent.getStatus());
        }
        Charge charge = Charge.schedule(sub.getId(), consent.getId(), cmd.amount(), cmd.scheduledFor());
        charges.save(charge);
        outbox.append(charge.pullPendingEvents());
        sub.registerCharge(cmd.scheduledFor());
        subscriptions.save(sub);
        log.info("charge.scheduled id={} subscriptionId={} for={}",
                charge.getId(), sub.getId(), cmd.scheduledFor());
        return charge.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Charge getById(UUID chargeId) {
        return charges.findById(chargeId).orElseThrow(() -> new ChargeNotFoundException(chargeId));
    }

    @Override
    @Transactional
    public void updateStatus(UpdateChargeStatusUseCase.Command cmd) {
        Charge charge = charges.findById(cmd.chargeId())
                .orElseThrow(() -> new ChargeNotFoundException(cmd.chargeId()));
        switch (cmd.status()) {
            case SETTLED -> charge.settle(cmd.occurredAt());
            case FAILED -> charge.fail(cmd.errorCode(), cmd.errorMessage());
        }
        charges.save(charge);
        outbox.append(charge.pullPendingEvents());
        log.info("charge.updated id={} status={}", charge.getId(), charge.getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public ListChargesUseCase.Result list(int page, int size) {
        return new ListChargesUseCase.Result(
                charges.findAll(page, size),
                charges.count(),
                page,
                size);
    }
}
