package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.SubscriptionDtos;
import dev.pmlsp.pixauto.domain.port.in.CreateSubscriptionUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final CreateSubscriptionUseCase createSubscription;

    @PostMapping
    public ResponseEntity<SubscriptionDtos.CreateSubscriptionResponse> create(
            @Valid @RequestBody SubscriptionDtos.CreateSubscriptionRequest req) {
        UUID id = createSubscription.create(
                new CreateSubscriptionUseCase.Command(req.consentId(), req.externalReference()));
        return ResponseEntity.created(URI.create("/v1/subscriptions/" + id))
                .body(new SubscriptionDtos.CreateSubscriptionResponse(id, "ACTIVE"));
    }
}
