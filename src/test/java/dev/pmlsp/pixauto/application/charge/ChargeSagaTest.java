package dev.pmlsp.pixauto.application.charge;

import dev.pmlsp.pixauto.domain.exception.BcbClientException;
import dev.pmlsp.pixauto.domain.exception.BcbServerException;
import dev.pmlsp.pixauto.domain.model.Charge;
import dev.pmlsp.pixauto.domain.model.EndToEndId;
import dev.pmlsp.pixauto.domain.model.Money;
import dev.pmlsp.pixauto.domain.port.out.BcbPixAutomaticoGateway;
import dev.pmlsp.pixauto.domain.port.out.BcbPixAutomaticoGateway.BcbChargeResponse;
import dev.pmlsp.pixauto.domain.port.out.ChargeRepository;
import dev.pmlsp.pixauto.domain.port.out.OutboxStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ChargeSagaTest {

    private ChargeRepository charges;
    private BcbPixAutomaticoGateway gateway;
    private OutboxStore outbox;
    private ChargeSaga saga;

    @BeforeEach
    void setup() {
        charges = mock(ChargeRepository.class);
        gateway = mock(BcbPixAutomaticoGateway.class);
        outbox = mock(OutboxStore.class);
        saga = new ChargeSaga(charges, gateway, outbox);
        when(charges.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void transitionsToInitiatedOnGatewaySuccess() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(), Money.brl("10.00"), LocalDate.now());
        when(charges.findById(c.getId())).thenReturn(Optional.of(c));
        when(gateway.initiateCharge(c))
                .thenReturn(new BcbChargeResponse(EndToEndId.generate("12345678"), "INITIATED"));

        saga.onChargeScheduled(c.getId());

        verify(charges).save(argThat(saved ->
                saved.getStatus() == dev.pmlsp.pixauto.domain.model.ChargeStatus.INITIATED));
    }

    @Test
    void transitionsToFailedOnClientError() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(), Money.brl("10.00"), LocalDate.now());
        when(charges.findById(c.getId())).thenReturn(Optional.of(c));
        when(gateway.initiateCharge(c))
                .thenThrow(new BcbClientException("INSUFFICIENT_FUNDS", "saldo"));

        saga.onChargeScheduled(c.getId());

        verify(charges).save(argThat(saved ->
                saved.getStatus() == dev.pmlsp.pixauto.domain.model.ChargeStatus.FAILED));
    }

    @Test
    void rethrowsServerErrorsForRetry() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(), Money.brl("10.00"), LocalDate.now());
        when(charges.findById(c.getId())).thenReturn(Optional.of(c));
        when(gateway.initiateCharge(c)).thenThrow(new BcbServerException("503", null));

        assertThatThrownBy(() -> saga.onChargeScheduled(c.getId()))
                .isInstanceOf(BcbServerException.class);
    }

    @Test
    void skipsIfAlreadyInitiated() {
        Charge c = Charge.schedule(UUID.randomUUID(), UUID.randomUUID(), Money.brl("10.00"), LocalDate.now());
        c.initiate(EndToEndId.generate("12345678"));
        when(charges.findById(c.getId())).thenReturn(Optional.of(c));

        saga.onChargeScheduled(c.getId());

        verifyNoInteractions(gateway);
    }
}
