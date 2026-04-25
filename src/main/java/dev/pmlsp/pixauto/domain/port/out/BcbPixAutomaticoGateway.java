package dev.pmlsp.pixauto.domain.port.out;

import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.Consent;
import dev.pmlsp.pixauto.domain.model.EndToEndId;

import java.time.Instant;

public interface BcbPixAutomaticoGateway {

    /**
     * Registers a recurrence consent with the BC. The consent must be in AUTHORIZED state.
     */
    BcbConsentResponse registerConsent(Consent consent);

    /**
     * Initiates a charge within an existing consent. Returns the E2E id assigned by the SPI.
     */
    BcbChargeResponse initiateCharge(Charge charge);

    record BcbConsentResponse(String bcbConsentId, String status, Instant createdAt) {}

    record BcbChargeResponse(EndToEndId endToEndId, String status) {}
}
