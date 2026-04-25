package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.SubscriptionDtos;
import dev.pmlsp.pixauto.domain.port.in.CreateSubscriptionUseCase;
import dev.pmlsp.pixauto.domain.port.in.GetSubscriptionUseCase;
import dev.pmlsp.pixauto.domain.port.in.ListSubscriptionsUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final CreateSubscriptionUseCase createSubscription;
    private final GetSubscriptionUseCase getSubscription;
    private final ListSubscriptionsUseCase listSubscriptions;

    @PostMapping
    public ResponseEntity<SubscriptionDtos.CreateSubscriptionResponse> create(
            @Valid @RequestBody SubscriptionDtos.CreateSubscriptionRequest req) {
        UUID id = createSubscription.create(
                new CreateSubscriptionUseCase.Command(req.consentId(), req.externalReference()));
        return ResponseEntity.created(URI.create("/v1/subscriptions/" + id))
                .body(new SubscriptionDtos.CreateSubscriptionResponse(id, "ACTIVE"));
    }

    @GetMapping
    public SubscriptionDtos.SubscriptionListResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = listSubscriptions.list(page, size);
        return new SubscriptionDtos.SubscriptionListResponse(
                result.items().stream().map(SubscriptionDtos.SubscriptionView::from).toList(),
                result.total(),
                result.page(),
                result.size());
    }

    @GetMapping("/{id}")
    public SubscriptionDtos.SubscriptionView get(@PathVariable UUID id) {
        return SubscriptionDtos.SubscriptionView.from(getSubscription.getById(id));
    }
}
