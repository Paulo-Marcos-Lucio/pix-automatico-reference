package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.adapter.web.dto.ConsentDtos;
import dev.pmlsp.pixauto.adapter.web.mapper.ConsentWebMapper;
import dev.pmlsp.pixauto.domain.port.in.AuthorizeConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.CreateConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.GetConsentUseCase;
import dev.pmlsp.pixauto.domain.port.in.ListConsentsUseCase;
import dev.pmlsp.pixauto.domain.port.in.RevokeConsentUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/v1/consents")
@RequiredArgsConstructor
public class ConsentController {

    private final CreateConsentUseCase createConsent;
    private final GetConsentUseCase getConsent;
    private final AuthorizeConsentUseCase authorizeConsent;
    private final RevokeConsentUseCase revokeConsent;
    private final ListConsentsUseCase listConsents;
    private final ConsentWebMapper mapper;

    @PostMapping
    public ResponseEntity<ConsentDtos.CreateConsentResponse> create(
            @Valid @RequestBody ConsentDtos.CreateConsentRequest request) {
        var cmd = mapper.toCommand(request);
        UUID id = createConsent.create(new CreateConsentUseCase.Command(
                cmd.payer(), cmd.receiverKey(), cmd.policy()));
        var body = new ConsentDtos.CreateConsentResponse(
                id, "AWAITING_AUTHORIZATION",
                "/v1/consents/" + id + "/authorize");
        return ResponseEntity.created(URI.create("/v1/consents/" + id)).body(body);
    }

    @GetMapping
    public ConsentDtos.ConsentListResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = listConsents.list(page, size);
        return new ConsentDtos.ConsentListResponse(
                result.items().stream().map(mapper::toView).toList(),
                result.total(),
                result.page(),
                result.size());
    }

    @GetMapping("/{id}")
    public ConsentDtos.ConsentView get(@PathVariable UUID id) {
        return mapper.toView(getConsent.getById(id));
    }

    @PostMapping("/{id}/authorize")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void authorize(@PathVariable UUID id) {
        authorizeConsent.authorize(id);
    }

    @PostMapping("/{id}/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable UUID id,
                       @Valid @RequestBody ConsentDtos.RevokeConsentRequest request) {
        revokeConsent.revoke(id, request.reason());
    }
}
