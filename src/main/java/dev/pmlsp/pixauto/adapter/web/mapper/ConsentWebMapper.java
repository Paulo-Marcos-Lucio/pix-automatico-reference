package dev.pmlsp.pixauto.adapter.web.mapper;

import dev.pmlsp.pixauto.adapter.web.dto.ConsentDtos;
import dev.pmlsp.pixauto.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.Currency;

@Component
public class ConsentWebMapper {

    public CreateConsentCommand toCommand(ConsentDtos.CreateConsentRequest req) {
        var payer = new EndUser(req.payer().document(), req.payer().name());
        var key = new PixKey(req.receiverKey().type(), req.receiverKey().value());
        var money = new Money(req.policy().amount(), Currency.getInstance(req.policy().currency()));
        var policy = new RecurrencePolicy(
                req.policy().frequency(), money,
                req.policy().firstCharge(),
                req.policy().endDate(),
                req.policy().maxOccurrences());
        return new CreateConsentCommand(payer, key, policy);
    }

    public ConsentDtos.ConsentView toView(Consent c) {
        return new ConsentDtos.ConsentView(
                c.getId(),
                c.getPayer().document(),
                c.getPayer().name(),
                c.getReceiverKey().type(),
                c.getReceiverKey().value(),
                c.getPolicy().frequency(),
                c.getPolicy().amount().amount(),
                c.getPolicy().amount().currency().getCurrencyCode(),
                c.getPolicy().firstCharge(),
                c.getPolicy().endDate(),
                c.getPolicy().maxOccurrences(),
                c.getStatus(),
                c.getCreatedAt(),
                c.getAuthorizedAt(),
                c.getRevokedAt(),
                c.getRevocationReason());
    }

    public record CreateConsentCommand(EndUser payer, PixKey receiverKey, RecurrencePolicy policy) {}
}
