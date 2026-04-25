package dev.pmlsp.pixauto.application.charge;

import dev.pmlsp.pixauto.domain.exception.BcbClientException;
import dev.pmlsp.pixauto.domain.exception.BcbServerException;
import dev.pmlsp.pixauto.domain.exception.ChargeNotFoundException;
import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.port.out.BcbPixAutomaticoGateway;
import dev.pmlsp.pixauto.domain.port.out.BcbPixAutomaticoGateway.BcbChargeResponse;
import dev.pmlsp.pixauto.domain.port.out.ChargeRepository;
import dev.pmlsp.pixauto.domain.port.out.OutboxStore;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Orchestrates the Scheduled -> Initiated transition by calling the BC gateway.
 * SETTLED/FAILED transitions come from {@link ChargeService#updateStatus(dev.pmlsp.pixauto.domain.port.in.UpdateChargeStatusUseCase.Command)}
 * triggered by webhooks or polling.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChargeSaga {

    private final ChargeRepository charges;
    private final BcbPixAutomaticoGateway gateway;
    private final OutboxStore outbox;

    @Retry(name = "bcb-initiate-charge")
    @CircuitBreaker(name = "bcb-initiate-charge")
    @Transactional
    public void onChargeScheduled(UUID chargeId) {
        Charge charge = charges.findById(chargeId).orElseThrow(() -> new ChargeNotFoundException(chargeId));

        if (charge.getStatus() != dev.pmlsp.pixauto.domain.model.ChargeStatus.SCHEDULED) {
            log.debug("saga.skip chargeId={} status={}", chargeId, charge.getStatus());
            return;
        }

        try {
            BcbChargeResponse response = gateway.initiateCharge(charge);
            charge.initiate(response.endToEndId());
            charges.save(charge);
            outbox.append(charge.pullPendingEvents());
            log.info("saga.charge.initiated id={} e2e={}", chargeId, response.endToEndId().value());
        } catch (BcbClientException e) {
            log.warn("saga.charge.failed.client id={} code={} msg={}", chargeId, e.errorCode(), e.getMessage());
            charge.fail(e.errorCode(), e.getMessage());
            charges.save(charge);
            outbox.append(charge.pullPendingEvents());
        } catch (BcbServerException e) {
            log.warn("saga.charge.retryable id={} msg={}", chargeId, e.getMessage());
            throw e;
        }
    }
}
