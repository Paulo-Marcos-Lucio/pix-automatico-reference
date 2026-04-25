package dev.pmlsp.pixauto.infrastructure.bcb;

import dev.pmlsp.pixauto.domain.exception.BcbClientException;
import dev.pmlsp.pixauto.domain.exception.BcbServerException;
import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.Consent;
import dev.pmlsp.pixauto.domain.model.EndToEndId;
import dev.pmlsp.pixauto.domain.port.out.BcbPixAutomaticoGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Mock implementation for local/dev/test. In production this is replaced by a real
 * HTTP client against the BC's Pix Automatico APIs with mTLS + ICP-Brasil + FAPI.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pixauto.bcb.mode", havingValue = "simulated", matchIfMissing = true)
public class SimulatedBcbGateway implements BcbPixAutomaticoGateway {

    private final String ispb;
    private final double failureRate;
    private final double retryableRate;

    public SimulatedBcbGateway(
            @Value("${pixauto.bcb.ispb:12345678}") String ispb,
            @Value("${pixauto.bcb.simulated.failure-rate:0.05}") double failureRate,
            @Value("${pixauto.bcb.simulated.retryable-rate:0.10}") double retryableRate) {
        this.ispb = ispb;
        this.failureRate = failureRate;
        this.retryableRate = retryableRate;
    }

    @Override
    public BcbConsentResponse registerConsent(Consent consent) {
        log.info("bcb.sim.registerConsent id={}", consent.getId());
        return new BcbConsentResponse("BCB-" + UUID.randomUUID(), "AUTHORIZED", Instant.now());
    }

    @Override
    public BcbChargeResponse initiateCharge(Charge charge) {
        double roll = ThreadLocalRandom.current().nextDouble();
        if (roll < retryableRate) {
            throw new BcbServerException("simulated 503 from BC", null);
        }
        if (roll < retryableRate + failureRate) {
            throw new BcbClientException("INSUFFICIENT_FUNDS", "simulated client rejection");
        }
        EndToEndId e2e = EndToEndId.generate(ispb);
        log.info("bcb.sim.initiateCharge chargeId={} e2e={}", charge.getId(), e2e.value());
        return new BcbChargeResponse(e2e, "INITIATED");
    }
}
